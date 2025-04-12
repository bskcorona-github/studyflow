const { execSync } = require("child_process");
const fs = require("fs");
const path = require("path");

// Windowsでの特殊フォルダへのアクセスを回避するためのスクリプト
console.log("Windows向けビルドスクリプトを実行中...");

try {
  // .nextフォルダが存在する場合は削除
  const nextDir = path.join(process.cwd(), ".next");
  if (fs.existsSync(nextDir)) {
    console.log(".nextフォルダを削除中...");
    fs.rmSync(nextDir, { recursive: true, force: true });
  }

  // ビルドコマンドを実行
  console.log("Next.jsのビルドを実行中...");
  execSync("next build", {
    env: {
      ...process.env,
      // Application Dataフォルダへのアクセスを無効化
      NODE_NO_WINDOWS: "1",
      // 追加の環境変数
      NEXT_TELEMETRY_DISABLED: "1",
    },
    stdio: "inherit",
  });

  console.log("ビルドが正常に完了しました！");
} catch (error) {
  console.error("ビルド中にエラーが発生しました:", error);
  process.exit(1);
}
