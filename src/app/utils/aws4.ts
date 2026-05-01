export class AwsV4 {
  private accessKeyID: string;
  private secretAccessKey: string;
  private path: string;
  private regionName: string;
  private serviceName: string;
  private httpMethodName: string;
  private payload: string;
  private awsHeaders: Record<string, string>;
  private strSignedHeader: string;
  private readonly HMACAlgorithm = "AWS4-HMAC-SHA256";
  private readonly aws4Request = "aws4_request";
  private xAmzDate: string;
  private currentDate: string;

  constructor(accessKeyID: string, secretAccessKey: string) {
    this.accessKeyID = accessKeyID;
    this.secretAccessKey = secretAccessKey;
    this.awsHeaders = {};
    this.xAmzDate = this.getTimeStamp();
    this.currentDate = this.getDate();
    this.path = "";
    this.regionName = "";
    this.serviceName = "";
    this.httpMethodName = "";
    this.payload = "";
    this.strSignedHeader = "";
  }

  setPath(path: string): void {
    this.path = path;
  }

  setServiceName(serviceName: string): void {
    this.serviceName = serviceName;
  }

  setRegionName(regionName: string): void {
    this.regionName = regionName;
  }

  setPayload(payload: string): void {
    this.payload = payload;
  }

  setRequestMethod(method: string): void {
    this.httpMethodName = method;
  }

  addHeader(headerName: string, headerValue: string): void {
    this.awsHeaders[headerName] = headerValue;
  }

  private async generateHex(data: string): Promise<string> {
    const msgBuffer = new TextEncoder().encode(data);
    const hashBuffer = await crypto.subtle.digest("SHA-256", msgBuffer);
    return Array.from(new Uint8Array(hashBuffer))
      .map((b) => b.toString(16).padStart(2, "0"))
      .join("");
  }

  private async getSignatureKey(
    key: string,
    dateStamp: string,
    regionName: string,
    serviceName: string
  ): Promise<ArrayBuffer> {
    const kSecret = "AWS4" + key;
    const kDate = await this.hmacSha256(kSecret, dateStamp);
    const kRegion = await this.hmacSha256(kDate, regionName);
    const kService = await this.hmacSha256(kRegion, serviceName);
    return await this.hmacSha256(kService, this.aws4Request);
  }

  private async hmacSha256(
    key: string | ArrayBuffer,
    message: string
  ): Promise<ArrayBuffer> {
    const keyBuffer =
      typeof key === "string" ? new TextEncoder().encode(key) : key;
    const messageBuffer = new TextEncoder().encode(message);

    const cryptoKey = await crypto.subtle.importKey(
      "raw",
      keyBuffer,
      { name: "HMAC", hash: "SHA-256" },
      false,
      ["sign"]
    );

    return await crypto.subtle.sign("HMAC", cryptoKey, messageBuffer);
  }

  private getTimeStamp(): string {
    return new Date().toISOString().replace(/[:-]|\.\d{3}/g, "");
  }

  private getDate(): string {
    return this.xAmzDate.slice(0, 8);
  }

  async getHeaders(): Promise<Record<string, string>> {
    this.awsHeaders["x-amz-date"] = this.xAmzDate;

    const signedHeaders = Object.keys(this.awsHeaders).sort().join(";");

    this.strSignedHeader = signedHeaders;

    // Prepare canonical request
    const canonicalHeaders = Object.entries(this.awsHeaders)
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([key, value]) => `${key}:${value}`)
      .join("\n");
    const payloadHash = await this.generateHex(this.payload);
    const canonicalRequest = [
      this.httpMethodName,
      this.path,
      "",
      canonicalHeaders + "\n",
      signedHeaders,
      payloadHash,
    ].join("\n");

    // Create string to sign
    const credentialScope = `${this.currentDate}/${this.regionName}/${this.serviceName}/${this.aws4Request}`;
    const stringToSign = [
      this.HMACAlgorithm,
      this.xAmzDate,
      credentialScope,
      await this.generateHex(canonicalRequest),
    ].join("\n");

    // Calculate signature
    const signingKey = await this.getSignatureKey(
      this.secretAccessKey,
      this.currentDate,
      this.regionName,
      this.serviceName
    );

    const signature = Array.from(
      new Uint8Array(await this.hmacSha256(signingKey, stringToSign))
    )
      .map((b) => b.toString(16).padStart(2, "0"))
      .join("");

    // Add authorization header
    this.awsHeaders["Authorization"] =
      `${this.HMACAlgorithm} ` +
      `Credential=${this.accessKeyID}/${credentialScope},` +
      `SignedHeaders=${signedHeaders},` +
      `Signature=${signature}`;

    return this.awsHeaders;
  }
}
