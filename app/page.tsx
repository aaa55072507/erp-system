export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-gray-50 text-gray-900">
      <div className="text-center space-y-6">
        <h1 className="text-4xl font-bold">
          場館 ERP 系統
        </h1>

        <p className="text-lg text-gray-600">
          管理預約 / 會員 / 場館 / 商品
        </p>

        <div className="flex gap-4 justify-center mt-6">
          <a
            href="/dashboard"
            className="px-6 py-3 bg-black text-white rounded-xl"
          >
            進入後台
          </a>

          <a
            href="/members"
            className="px-6 py-3 border rounded-xl"
          >
            會員管理
          </a>
        </div>
      </div>
    </main>
  );
}