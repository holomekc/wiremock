const PROXY_CONFIG = [
  {
    context: [
      "/__admin/mappings",
      "/__admin/requests",
      "/__admin/recordings/**",
      "/__admin/proxy",
      "/__admin/scenarios",
      "/__admin/shutdown",
      "/__admin/files",
      "/__admin/version",
    ],
    target: "http://127.0.0.1:8089",
    secure: false,
  },
];

module.exports = PROXY_CONFIG;
