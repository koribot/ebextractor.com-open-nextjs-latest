"use client";
import { api_paths } from "@/app/contants/api-paths";
import { AuthUserMeResponse } from "@/app/model/User";
import requests from "@/app/utils/http";
import {
  LocalStorageManager,
  usidStorageLocalStorage,
} from "@/app/utils/LocalStorageManager";
import { logger } from "@/app/utils/logger";
import React, { useEffect } from "react";

const checkStatus = (status: string | null | undefined) => {
  //   if (status === "logged-in") {
  //     return true;
  //   }
  if (status === "logged-out") {
    return false;
  }
  if (status === "undefined" || status === null) {
    return true;
  }
  if (
    status &&
    status.length > 0 &&
    status !== "logged-in" &&
    status !== "logged-out"
  ) {
    return true;
  }
  return false;
};

const UsidChecker = () => {
  const create = async () => {
    const res = await requests.get<AuthUserMeResponse>(api_paths.get_user);
    const data = res.requestsData?.user?.id;
    const response = usidStorageLocalStorage.upsert("usid", data);
    if (data) {
      usidStorageLocalStorage.upsert("status", "logged-in");
    } else {
      usidStorageLocalStorage.upsert("status", "logged-out");
    }
    logger.debug.log(
      `Create usid ${response.success ? "Success" : "Failed"}`,
      response,
    );
  };
  useEffect(() => {
    const response = usidStorageLocalStorage.getById("usid");
    const statusResponse = usidStorageLocalStorage.getById("status");
    const isStatus = checkStatus(statusResponse.data?.value);
    if (
      (!response.data?.value && statusResponse.data?.value === "logged-in") ||
      isStatus ||
      !statusResponse.data ||
      !response.data
    ) {
      create();
    }
  }, []);
  return null;
};

export default UsidChecker;
