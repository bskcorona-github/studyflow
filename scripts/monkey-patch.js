// Windowsの権限エラーを回避するためのモンキーパッチング
console.log("Windowsのモンキーパッチングを適用中...");

const fs = require("fs");
const path = require("path");
const os = require("os");

// Windowsの特殊フォルダのリスト
const specialFolders = [
  "Application Data",
  "AppData",
  "NetHood",
  "PrintHood",
  "Recent",
  "SendTo",
  "Templates",
  "Cookies",
  "History",
  "Local Settings",
  "My Documents",
  "Start Menu",
  "スタート メニュー",
  "Temporary Internet Files",
];

// 一時ディレクトリに偽のApplication Dataディレクトリを作成
const fakeTmpDir = path.join(os.tmpdir(), "fake-app-data");
try {
  if (!fs.existsSync(fakeTmpDir)) {
    fs.mkdirSync(fakeTmpDir, { recursive: true });
  }

  // 一時ファイルを作成（書き込みエラー回避のため）
  const fakeConfigFile = path.join(fakeTmpDir, "config.json");
  if (!fs.existsSync(fakeConfigFile)) {
    fs.writeFileSync(fakeConfigFile, "{}", "utf8");
  }
} catch (error) {
  console.error("一時ディレクトリの作成に失敗:", error);
}

// ミューテックスファイル
const fakeMutexFile = path.join(fakeTmpDir, "mutex");
if (!fs.existsSync(fakeMutexFile)) {
  try {
    fs.writeFileSync(fakeMutexFile, "");
  } catch (error) {
    console.error("ミューテックスファイルの作成に失敗:", error);
  }
}

// 特殊フォルダへのアクセスをチェックする関数
function isSpecialFolder(pathToCheck) {
  if (typeof pathToCheck !== "string") return false;

  // 一時ディレクトリ自体はチェック対象外にする
  if (pathToCheck.startsWith(fakeTmpDir)) return false;

  return specialFolders.some((folder) => pathToCheck.includes(folder));
}

// パスから偽のパスを生成する関数
function getFakePath(originalPath) {
  const basename = path.basename(originalPath);
  // 特殊なpathオブジェクトを使ってパスを結合する
  return `${fakeTmpDir}/${basename}`;
}

// 再帰防止フラグ
let inPathJoin = false;
let inPathResolve = false;

// Application Dataフォルダへのアクセスを防止するためのフック
const originalJoin = path.join;
path.join = function (...paths) {
  if (inPathJoin) return originalJoin(...paths);

  inPathJoin = true;
  try {
    const joined = originalJoin(...paths);
    if (isSpecialFolder(joined)) {
      const fakePath = getFakePath(joined);
      inPathJoin = false;
      return fakePath;
    }
    inPathJoin = false;
    return joined;
  } catch (error) {
    inPathJoin = false;
    return originalJoin(...paths);
  }
};

const originalResolve = path.resolve;
path.resolve = function (...paths) {
  if (inPathResolve) return originalResolve(...paths);

  inPathResolve = true;
  try {
    const resolved = originalResolve(...paths);
    if (isSpecialFolder(resolved)) {
      const fakePath = getFakePath(resolved);
      inPathResolve = false;
      return fakePath;
    }
    inPathResolve = false;
    return resolved;
  } catch (error) {
    inPathResolve = false;
    return originalResolve(...paths);
  }
};

const originalReaddirSync = fs.readdirSync;
fs.readdirSync = function (dirPath, options) {
  if (typeof dirPath === "string" && isSpecialFolder(dirPath)) {
    // 一時ディレクトリの内容を返す
    try {
      return originalReaddirSync(fakeTmpDir, options);
    } catch (error) {
      return [];
    }
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

const originalStatSync = fs.statSync;
fs.statSync = function (path, options) {
  if (typeof path === "string" && isSpecialFolder(path)) {
    try {
      const fakePath = getFakePath(path);
      return originalStatSync(fakePath, options);
    } catch (error) {
      throw new Error("ENOENT: no such file or directory");
    }
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

// readFileSyncをモンキーパッチ
const originalReadFileSync = fs.readFileSync;
fs.readFileSync = function (path, options) {
  if (typeof path === "string") {
    // 特殊フォルダの場合
    if (isSpecialFolder(path)) {
      try {
        const fakePath = getFakePath(path);

        // ファイルが存在するかチェック
        if (fs.existsSync(fakePath)) {
          return originalReadFileSync(fakePath, options);
        }

        // ファイルが存在しない場合は空文字列を返す
        if (typeof options === "object" && options.encoding) {
          return "";
        }
        return Buffer.from("");
      } catch (error) {
        if (typeof options === "object" && options.encoding) {
          return "";
        }
        return Buffer.from("");
      }
    }
  }

  try {
    return originalReadFileSync(path, options);
  } catch (error) {
    if (
      error.code === "EPERM" ||
      error.code === "EACCES" ||
      error.code === "EISDIR"
    ) {
      if (typeof options === "object" && options.encoding) {
        return "";
      }
      return Buffer.from("");
    }
    throw error;
  }
};

// writeFileSyncをモンキーパッチ
const originalWriteFileSync = fs.writeFileSync;
fs.writeFileSync = function (path, data, options) {
  if (typeof path === "string" && isSpecialFolder(path)) {
    try {
      const fakePath = getFakePath(path);
      return originalWriteFileSync(fakePath, data, options);
    } catch (error) {
      // 書き込みエラーを無視
      return;
    }
  }

  try {
    return originalWriteFileSync(path, data, options);
  } catch (error) {
    if (error.code === "EPERM" || error.code === "EACCES") {
      // 書き込みエラーを無視
      return;
    }
    throw error;
  }
};

// existsSyncをモンキーパッチ
const originalExistsSync = fs.existsSync;
fs.existsSync = function (path) {
  if (typeof path === "string" && isSpecialFolder(path)) {
    try {
      const fakePath = getFakePath(path);
      return originalExistsSync(fakePath);
    } catch (error) {
      return false;
    }
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

// mkdirSyncをモンキーパッチ
const originalMkdirSync = fs.mkdirSync;
fs.mkdirSync = function (path, options) {
  if (typeof path === "string" && isSpecialFolder(path)) {
    try {
      const fakePath = getFakePath(path);
      return originalMkdirSync(fakePath, options);
    } catch (error) {
      // ディレクトリ作成エラーを無視
      return;
    }
  }

  try {
    return originalMkdirSync(path, options);
  } catch (error) {
    if (error.code === "EPERM" || error.code === "EACCES") {
      // ディレクトリ作成エラーを無視
      return;
    }
    throw error;
  }
};

// テレメトリを無効化
process.env.NEXT_TELEMETRY_DISABLED = "1";

// 非同期処理のためのフック
process.nextTick(() => {
  try {
    // 特殊フォルダを作成しておく
    for (const folder of specialFolders) {
      const fakePath = getFakePath(folder);
      if (!fs.existsSync(fakePath)) {
        fs.mkdirSync(fakePath, { recursive: true });
      }
    }
  } catch (e) {
    // エラーを無視
  }
});

console.log("モンキーパッチング完了");

// モジュールを外部に公開
module.exports = {};
