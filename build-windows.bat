@echo off
echo Windows用ビルドスクリプトを実行します...

:: 環境変数を設定
set NODE_NO_WINDOWS=1
set NEXT_TELEMETRY_DISABLED=1
set NODE_OPTIONS=--max-old-space-size=4096

:: .nextフォルダを削除
if exist ".next" (
  echo .nextフォルダを削除しています...
  rmdir /s /q .next
)

:: ビルドを実行
echo Next.jsのビルドを実行中...
call npx next build --no-lint

if %ERRORLEVEL% == 0 (
  echo ビルドが正常に完了しました！
) else (
  echo ビルドに失敗しました。
  exit /b 1
) 