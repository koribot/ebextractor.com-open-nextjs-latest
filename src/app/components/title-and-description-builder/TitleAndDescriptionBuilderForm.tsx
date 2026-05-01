"use client";
import requests from "@/app/utils/http";
import React from "react";

const TitleAndDescriptionBuilderForm = () => {
  const [data, setData] = React.useState<any>(null);
  const [isLoading, setIsLoading] = React.useState(false);
  const [progress, setProgress] = React.useState(0);
  const [isSubmitted, setIsSubmitted] = React.useState(false);

  React.useEffect(() => {
    let progressInterval: NodeJS.Timeout;
    if (isLoading) {
      progressInterval = setInterval(() => {
        setProgress((prev) => {
          if (prev >= 90) return prev;
          return prev + Math.random() * 15;
        });
      }, 600);
    } else {
      setProgress(100);
    }
    return () => clearInterval(progressInterval);
  }, [isLoading]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setData(null);
    setProgress(0);
    setIsLoading(true);
    const keywords = (
      (e.target as HTMLFormElement).elements.namedItem(
        "keywords"
      ) as HTMLInputElement
    ).value;
    const formData = new FormData();
    formData.append("model", "@cf/openchat/openchat-3.5-0106");
    formData.append("keywords", keywords);
    const res = await requests.postFormData(
      "/api/title-and-description-builder",
      formData
    );
    const _data = await res.requestsData;
    console.log(_data);
    setData(_data);
    setIsLoading(false);
    setIsSubmitted(true);
  };

  return (
    <div className="min-h-screen p-6 flex flex-col items-center dark:bg-light-dark">
      <div className="w-full max-w-2xl">
        <div className="bg-white/70 dark:bg-gray-800/70 backdrop-blur-lg rounded-3xl shadow-xl p-8 transition-all duration-300 ease-in-out transform hover:shadow-2xl border border-gray-100 dark:border-gray-700">
          <div className="flex items-center justify-center mb-8">
            <div className="relative">
              <h1 className="text-4xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent dark:from-indigo-400 dark:to-purple-400">
                Title and Description Builder
              </h1>
              <div className="absolute -bottom-2 w-full h-1 bg-gradient-to-r from-indigo-600 to-purple-600 dark:from-indigo-400 dark:to-purple-400 rounded-full transform scale-x-0 transition-transform duration-300 group-hover:scale-x-100" />
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <label
                htmlFor="keywords"
                className="block text-sm font-medium text-gray-700 dark:text-gray-300"
              >
                Enter product keywords
              </label>
              <div className="relative">
                <textarea
                  id="keywords"
                  name="keywords"
                  rows={4}
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-gray-700 focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all duration-200 resize-none bg-white/50 dark:bg-gray-700/50 backdrop-blur-sm dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-500"
                  placeholder="Enter your keywords here..."
                  required
                  disabled={isLoading}
                />
                <div className="absolute right-3 bottom-3 text-xs text-gray-400 dark:text-gray-500">
                  Please be concise
                </div>
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className={`w-full py-3 px-6 rounded-xl text-white font-medium transition-all duration-200
                ${
                  isLoading
                    ? "bg-gray-400 dark:bg-gray-600 cursor-not-allowed"
                    : "bg-gradient-to-r from-indigo-600 to-purple-600 dark:from-indigo-500 dark:to-purple-500 hover:from-indigo-700 hover:to-purple-700 active:transform active:scale-[0.98] hover:shadow-lg"
                }`}
            >
              {isLoading ? (
                <div className="flex items-center justify-center space-x-2">
                  <div
                    className="w-2 h-2 bg-white rounded-full animate-bounce"
                    style={{ animationDelay: "0ms" }}
                  />
                  <div
                    className="w-2 h-2 bg-white rounded-full animate-bounce"
                    style={{ animationDelay: "150ms" }}
                  />
                  <div
                    className="w-2 h-2 bg-white rounded-full animate-bounce"
                    style={{ animationDelay: "300ms" }}
                  />
                </div>
              ) : (
                "Generate"
              )}
            </button>

            {isLoading && (
              <div className="space-y-2">
                <div className="h-2 w-full bg-gray-100 dark:bg-gray-700 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-indigo-600 to-purple-600 dark:from-indigo-400 dark:to-purple-400 transition-all duration-300 ease-out"
                    style={{ width: `${progress}%` }}
                  />
                </div>
                <p className="text-center text-sm text-gray-500 dark:text-gray-400 animate-pulse">
                  Please wait while we generate your content... This might take
                  a minute.
                </p>
              </div>
            )}
          </form>
        </div>

        {data && (
          <div className="mt-8 bg-white/70 dark:bg-gray-800/70 backdrop-blur-lg rounded-3xl shadow-xl p-8 transition-all duration-500 animate-fade-in border border-gray-100 dark:border-gray-700">
            <h2 className="text-2xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 dark:from-indigo-400 dark:to-purple-400 bg-clip-text text-transparent mb-6">
              Generated Content
            </h2>

            <div className="space-y-6">
              <div className="group">
                <h3 className="text-lg font-semibold text-gray-700 dark:text-gray-300 mb-2">
                  Title
                </h3>
                <div className="p-4 bg-white/50 dark:bg-gray-700/50 backdrop-blur-sm rounded-xl border border-gray-100 dark:border-gray-700 transition-all duration-200 group-hover:shadow-md">
                  <p className="text-gray-800 dark:text-gray-100">
                    {data.title}
                  </p>
                </div>
                <p className="text-sm text-gray-500 dark:text-gray-400 mt-2 flex items-center gap-1">
                  <span className="w-2 h-2 rounded-full bg-indigo-500 dark:bg-indigo-400" />
                  Characters: {data.characterCount}
                </p>
              </div>

              <div className="group">
                <h3 className="text-lg font-semibold text-gray-700 dark:text-gray-300 mb-2">
                  Description
                </h3>
                <div className="p-4 bg-white/50 dark:bg-gray-700/50 backdrop-blur-sm rounded-xl border border-gray-100 dark:border-gray-700 transition-all duration-200 group-hover:shadow-md">
                  <p className="text-gray-800 dark:text-gray-100 whitespace-pre-wrap">
                    {data.description}
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default TitleAndDescriptionBuilderForm;
