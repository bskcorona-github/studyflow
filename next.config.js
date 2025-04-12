/** @type {import('next').NextConfig} */

// Windowsの権限エラーを回避するための設定
const fs = require("fs");
const path = require("path");
const os = require("os");

// Windows専用の対応
if (os.platform() === "win32") {
  // パスを書き換え
  const originalJoin = path.join;
  path.join = function (...paths) {
    const joinedPath = originalJoin(...paths);
    // Application Dataディレクトリへのパスを検出したら回避
    if (
      joinedPath.includes("Application Data") ||
      joinedPath.includes("AppData")
    ) {
      // 一時ディレクトリを代わりに返す
      return originalJoin(os.tmpdir(), "mock-appdata");
    }
    return joinedPath;
  };

  // 特定のフォルダへのアクセスを制限するためのフック
  const originalReaddirSync = fs.readdirSync;
  const originalStatSync = fs.statSync;
  const originalExistsSync = fs.existsSync;

  // Application Dataフォルダへのアクセスを防止
  const blockedPaths = [
    "C:\\Users\\pochi\\Application Data",
    "C:/Users/pochi/Application Data",
    "Application Data",
    "AppData",
  ];

  fs.readdirSync = function (dirPath, options) {
    // ブロックされたパスへのアクセスを防止
    if (
      typeof dirPath === "string" &&
      blockedPaths.some((blocked) => dirPath.includes(blocked))
    ) {
      return [];
    }
    try {
      return originalReaddirSync(dirPath, options);
    } catch (error) {
      if (error.code === "EPERM" || error.code === "EACCES") {
        return [];
      }
      throw error;
    }
  };

  fs.statSync = function (path, options) {
    // ブロックされたパスへのアクセスを防止
    if (
      typeof path === "string" &&
      blockedPaths.some((blocked) => path.includes(blocked))
    ) {
      throw new Error("ENOENT: no such file or directory");
    }
    try {
      return originalStatSync(path, options);
    } catch (error) {
      if (error.code === "EPERM" || error.code === "EACCES") {
        throw new Error("ENOENT: no such file or directory");
      }
      throw error;
    }
  };

  fs.existsSync = function (path) {
    // ブロックされたパスへのアクセスを防止
    if (
      typeof path === "string" &&
      blockedPaths.some((blocked) => path.includes(blocked))
    ) {
      return false;
    }
    try {
      return originalExistsSync(path);
    } catch (error) {
      if (error.code === "EPERM" || error.code === "EACCES") {
        return false;
      }
      throw error;
    }
  };
}

const nextConfig = {
  /* config options here */
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "lh3.googleusercontent.com",
        pathname: "/**",
      },
    ],
  },
  output: "standalone", // スタンドアローンビルドモードを有効化
  // 権限エラーを回避するための設定
  experimental: {
    outputFileTracingExcludes: {
      "*": [
        "node_modules/@swc/core-win32-x64-msvc",
        "node_modules/next/dist/compiled/@ampproject/toolbox-optimizer",
        "node_modules/next/dist/server/lib/squoosh/**",
        "**/node_modules/sharp/**",
        "**/.git/**",
        "**/Application Data/**",
        "**/AppData/**",
        "**/Local Settings/**",
      ],
    },
  },
  // ビルド中に無視するパターンを指定
  onDemandEntries: {
    // パフォーマンス向上のための設定
    maxInactiveAge: 25 * 1000,
    pagesBufferLength: 2,
  },
};

module.exports = nextConfig;
