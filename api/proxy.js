import fetch from "node-fetch";

export default async function handler(req, res) {
  const apiBaseUrl = "http://bussiness-cloud.com:5050";

  try {
    const apiResponse = await fetch(apiBaseUrl + req.url, {
      method: req.method,
      headers: {
        ...req.headers,
        host: undefined,
      },
      body:
        req.method !== "GET" && req.method !== "HEAD" ? req.body : undefined,
    });

    apiResponse.headers.forEach((value, key) => {
      res.setHeader(key, value);
    });

    const data = await apiResponse.buffer();
    res.status(apiResponse.status).send(data);
  } catch (error) {
    res.status(500).json({ error: "Proxy error", details: error.message });
  }
}
