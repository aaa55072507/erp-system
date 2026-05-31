export async function sendLine(userId: string, message: string) {
  await fetch("/api/line/push", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ userId, message }),
  });
}