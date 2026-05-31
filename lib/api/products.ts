//
// 🧱 PRODUCTS API
//

export async function getProducts() {
  const res = await fetch("/api/products");
  const json = await res.json();
  return json.data;
}

export async function createProduct(data: {
  name: string;
  price: number;
  category_id?: string;
}) {
  const res = await fetch("/api/products", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(data),
  });

  const json = await res.json();
  return json;
}

export async function updateProduct(data: {
  id: string;
  name?: string;
  price?: number;
  category_id?: string;
}) {
  const res = await fetch("/api/products", {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(data),
  });

  const json = await res.json();
  return json;
}

export async function deleteProduct(id: string) {
  const res = await fetch(`/api/products?id=${id}`, {
    method: "DELETE",
  });

  const json = await res.json();
  return json;
}

//
// 📦 INVENTORY API
//

export async function addStock(data: {
  product_id: string;
  quantity: number;
  note?: string;
}) {
  const res = await fetch("/api/inventory", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      ...data,
      type: "in",
    }),
  });

  const json = await res.json();
  return json;
}

export async function reduceStock(data: {
  product_id: string;
  quantity: number;
  note?: string;
}) {
  const res = await fetch("/api/inventory", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      ...data,
      type: "out",
    }),
  });

  const json = await res.json();
  return json;
}