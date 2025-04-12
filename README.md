# StudyFlow - AI 学習スケジューラー

AI を活用して学習計画を自動生成し、効率的な学習をサポートするアプリケーション。

## 主な機能

- 🔐 Google ログイン認証
- 🎯 学習目標・期限の設定
- 🧠 Gemini AI による学習スケジュール自動生成
- ✅ 「今日やること」を ToDo 形式で表示
- 🔁 進捗に応じたスケジュール再構成
- 📊 学習履歴・進捗の可視化

## 技術スタック

- Next.js (TypeScript)
- Tailwind CSS
- MySQL + Prisma ORM
- NextAuth.js (Google 認証)
- Gemini 1.5 Flash API

## 開発環境のセットアップ

### 必要条件

- Node.js 18.0.0 以上
- MySQL

### インストール手順

1. リポジトリをクローン

   ```
   git clone <repository-url>
   cd studyflow
   ```

2. 依存関係のインストール

   ```
   npm install
   ```

3. 環境変数の設定
   `.env.local`ファイルを作成し、以下の環境変数を設定:

   ```
   DATABASE_URL="mysql://root:@localhost:3306/study_flow"
   NEXTAUTH_URL=http://localhost:3000
   NEXTAUTH_SECRET=<your-secret-key>
   GOOGLE_ID=<your-google-client-id>
   GOOGLE_SECRET=<your-google-client-secret>
   GEMINI_API_KEY=<your-gemini-api-key>
   ```

4. データベースのセットアップ

   ```
   npx prisma migrate dev
   ```

5. 開発サーバーの起動
   ```
   npm run dev
   ```

## 使い方

1. Google アカウントでログイン
2. 「新しい目標を追加」から学習目標を設定
3. AI が自動的に学習スケジュールを生成
4. ダッシュボードで今日のタスクを確認
5. タスクを完了したらチェック
6. 進捗状況をグラフで確認

## ライセンス

MIT
