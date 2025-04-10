# StudyFlow - AI 学習計画生成アプリ

StudyFlow は、AI を活用して学習目標に合わせた最適な学習計画を自動生成するアプリケーションです。

## 主な機能

- ユーザー認証（Google 連携またはメールアドレス）
- 学習目標の設定（分野、目標、期限、学習頻度）
- AI による学習計画の自動生成
- 日次タスク管理と進捗トラッキング
- 自動リバランス機能（タスク未完了時）
- 進捗グラフ表示

## 技術スタック

- フロントエンド/バックエンド: Next.js (App Router)
- データベース: MySQL (Prisma ORM)
- 認証: NextAuth.js
- AI 連携: Gemini Pro API
- UI: Tailwind CSS + DaisyUI
- グラフ表示: Chart.js

## 環境構築

### 前提条件

- Node.js 18.x 以上
- MySQL 8.0 以上
- npm 9.x 以上

### インストール手順

1. リポジトリをクローン

```bash
git clone https://github.com/yourusername/studyflow.git
cd studyflow
```

2. 依存関係のインストール

```bash
npm install
```

3. 環境変数の設定

`.env`ファイルを作成し、以下の内容を設定してください：

```
DATABASE_URL="mysql://username:password@localhost:3306/study_flow"
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=<random_secret>
GOOGLE_ID=<your_google_client_id>
GOOGLE_SECRET=<your_google_client_secret>
GEMINI_API_KEY=<your_gemini_api_key>
```

4. データベースのセットアップ

```bash
npx prisma db push
```

5. 開発サーバーの起動

```bash
npm run dev
```

6. ブラウザで `http://localhost:3000` にアクセス

## 利用方法

1. アカウントを作成してログイン
2. 「新しい目標を追加」から学習目標を設定
3. AI が学習計画を自動生成
4. ダッシュボードから今日のタスクを確認
5. タスク完了時にチェックして進捗を記録

## ライセンス

MIT License
