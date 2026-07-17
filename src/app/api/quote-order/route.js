import { NextResponse } from "next/server";
import { WP_BASE } from "@/config";

function toText(value) {
  if (value === undefined || value === null || value === false) return "";
  return String(value).trim();
}

function getCredentials() {
  const user = process.env.WP_API_USER;
  const pass = process.env.WP_API_PASS;

  if (!user || !pass) return "";
  return Buffer.from(`${user}:${pass}`).toString("base64");
}

function normalizeItems(items) {
  if (!Array.isArray(items)) return [];

  return items
    .map((item) => {
      const productId = Number(item?.productId);
      const quantity = Math.max(1, Number(item?.quantity) || 1);

      if (!Number.isInteger(productId) || productId <= 0) return null;

      return {
        product_id: productId,
        quantity,
        meta_data: [
          { key: "Quote product name", value: toText(item.productName) },
          { key: "Article number", value: toText(item.articleNumber) },
          { key: "Available model", value: toText(item.model) },
        ].filter((meta) => meta.value),
      };
    })
    .filter(Boolean);
}

function buildCustomerNote(form, items) {
  const message = toText(form.message);
  const productLines = items
    .map((item) => {
      const parts = [
        toText(item.productName) || `Product ${item.productId}`,
        item.model ? `Model: ${toText(item.model)}` : "",
        item.articleNumber ? `Article: ${toText(item.articleNumber)}` : "",
        `Qty: ${Math.max(1, Number(item.quantity) || 1)}`,
      ].filter(Boolean);

      return `- ${parts.join(" | ")}`;
    })
    .join("\n");

  return [
    "Quote request from website cart.",
    message ? `Message: ${message}` : "",
    productLines ? `Products:\n${productLines}` : "",
  ]
    .filter(Boolean)
    .join("\n\n");
}

export async function POST(request) {
  let body;

  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid request body." }, { status: 400 });
  }

  const form = body?.form || {};
  const items = Array.isArray(body?.items) ? body.items : [];
  const name = toText(form.name);
  const email = toText(form.email);
  const phone = toText(form.phone);
  const company = toText(form.company);

  if (!name || !email || !phone) {
    return NextResponse.json(
      { error: "Name, email, and phone are required." },
      { status: 400 }
    );
  }

  if (items.length === 0) {
    return NextResponse.json(
      { error: "Please add at least one product before submitting." },
      { status: 400 }
    );
  }

  const lineItems = normalizeItems(items);

  if (lineItems.length === 0) {
    return NextResponse.json(
      { error: "Cart products could not be matched to WooCommerce products." },
      { status: 400 }
    );
  }

  const credentials = getCredentials();

  if (!credentials) {
    return NextResponse.json(
      { error: "WooCommerce credentials are not configured." },
      { status: 500 }
    );
  }

  const [firstName, ...lastNameParts] = name.split(/\s+/);
  const orderPayload = {
    status: "pending",
    set_paid: false,
    billing: {
      first_name: firstName || name,
      last_name: lastNameParts.join(" "),
      company,
      email,
      phone,
    },
    customer_note: buildCustomerNote(form, items),
    line_items: lineItems,
    meta_data: [
      { key: "Quote request", value: "yes" },
      { key: "Quote contact name", value: name },
      { key: "Quote contact email", value: email },
      { key: "Quote contact phone", value: phone },
      { key: "Quote contact company", value: company },
    ].filter((meta) => meta.value),
  };

  const response = await fetch(`${WP_BASE}/wc/v3/orders`, {
    method: "POST",
    headers: {
      Authorization: `Basic ${credentials}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(orderPayload),
    cache: "no-store",
  });

  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    return NextResponse.json(
      {
        error:
          data?.message ||
          "Unable to create the WooCommerce order. Please try again.",
      },
      { status: response.status }
    );
  }

  // Orders created directly in the "pending" state do not pass through the
  // status transition used by WooCommerce's transactional email hooks. Move
  // the new quote to "on-hold" after creation so the admin new-order email
  // and the customer's on-hold email are triggered by WooCommerce.
  const emailResponse = await fetch(`${WP_BASE}/wc/v3/orders/${data.id}`, {
    method: "PUT",
    headers: {
      Authorization: `Basic ${credentials}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ status: "on-hold" }),
    cache: "no-store",
  });

  const updatedOrder = await emailResponse.json().catch(() => ({}));

  if (!emailResponse.ok) {
    console.error("Quote order created, but its email status transition failed", {
      orderId: data?.id,
      status: emailResponse.status,
      message: updatedOrder?.message,
    });

    return NextResponse.json({
      orderId: data?.id,
      orderKey: data?.order_key,
      status: data?.status,
      warning:
        "Your quote request was created, but the notification email could not be triggered. Please contact us with your order number.",
    });
  }

  return NextResponse.json({
    orderId: updatedOrder?.id || data?.id,
    orderKey: updatedOrder?.order_key || data?.order_key,
    status: updatedOrder?.status || data?.status,
  });
}
