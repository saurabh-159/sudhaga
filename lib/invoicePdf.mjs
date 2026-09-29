import { jsPDF } from 'jspdf';

const INK = [22, 19, 17];
const GOLD = [208, 177, 90];
const CREAM = [250, 247, 243];
const MUTED = [120, 113, 104];
const LINE = [214, 206, 194];
const WHITE = [255, 255, 255];
const BLACK = [0, 0, 0];

const PAGE_W = 210;
const PAGE_H = 297;
const FRAME = 8;
const LEFT = 14;
const CONTENT_W = PAGE_W - LEFT * 2;
const BOTTOM = 270;

function money(value) {
  const amount = Number(value) || 0;
  return `Rs. ${amount.toLocaleString('en-IN', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;
}

function formatPhone(phone) {
  const raw = String(phone || '').trim();
  const digits = raw.replace(/\D/g, '');
  const local =
    digits.length === 10
      ? digits
      : digits.length === 11 && digits.startsWith('0')
        ? digits.slice(1)
        : digits.length === 12 && digits.startsWith('91')
          ? digits.slice(2)
          : '';
  if (local.length === 10) return `+91 ${local.slice(0, 5)} ${local.slice(5)}`;
  return raw;
}

function wrapped(doc, text, width) {
  const value = String(text || '').trim();
  if (!value) return ['—'];
  return doc.splitTextToSize(value, width);
}

function orderItems(order) {
  if (Array.isArray(order.lineItems) && order.lineItems.length) return order.lineItems;
  if (Array.isArray(order.items)) return order.items;
  return [];
}

function billOf(order, items) {
  const subtotal =
    order.subtotal ??
    items.reduce((sum, item) => sum + Number(item.price || 0) * Number(item.qty || 0), 0);
  const discount = Number(order.discount || 0);
  const shipping = order.shippingFee ?? (order.subtotal == null ? 0 : Number(subtotal) > 999 ? 0 : 49);
  const tax = order.tax ?? (order.subtotal == null ? 0 : Math.round((Number(subtotal) - discount) * 0.18));
  const total = Number(order.total || Number(subtotal) - discount + Number(shipping) + Number(tax));
  return {
    subtotal: Number(subtotal) || 0,
    discount,
    shipping: Number(shipping) || 0,
    tax: Number(tax) || 0,
    total,
  };
}

function customerOf(order) {
  const shipping = order.shipping && typeof order.shipping === 'object' ? order.shipping : {};
  const account = order.user && typeof order.user === 'object' ? order.user : {};
  const cityLine = [shipping.city, shipping.state].filter(Boolean).join(', ');
  const place = [cityLine, shipping.pincode].filter(Boolean).join(' — ');
  const address = [shipping.address, place].filter((line) => String(line || '').trim());
  if (address.length) address.push('India');
  return {
    name: shipping.name || account.name || 'Customer',
    phone: formatPhone(shipping.phone),
    email: shipping.email || account.email || '',
    address,
  };
}

function paymentLabel(order) {
  if (order.paymentId || order.razorpayOrderId) return 'Razorpay';
  if (order.status === 'Pending') return 'Awaiting payment';
  if (order.status === 'Cancelled') return 'Cancelled';
  return 'Online';
}

function loadImage(src) {
  return new Promise((resolve) => {
    if (typeof Image === 'undefined') {
      resolve(null);
      return;
    }
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => {
      try {
        const canvas = document.createElement('canvas');
        canvas.width = img.naturalWidth;
        canvas.height = img.naturalHeight;
        canvas.getContext('2d').drawImage(img, 0, 0);
        resolve({
          dataUrl: canvas.toDataURL('image/png'),
          w: img.naturalWidth,
          h: img.naturalHeight,
        });
      } catch {
        resolve(null);
      }
    };
    img.onerror = () => resolve(null);
    img.src = src;
  });
}

function paintFrame(doc) {
  doc.setDrawColor(...INK);
  doc.setLineWidth(0.7);
  doc.rect(FRAME, FRAME, PAGE_W - FRAME * 2, PAGE_H - FRAME * 2);
  doc.setDrawColor(...GOLD);
  doc.setLineWidth(0.35);
  doc.rect(FRAME + 1.4, FRAME + 1.4, PAGE_W - (FRAME + 1.4) * 2, PAGE_H - (FRAME + 1.4) * 2);
}

function paintFooter(doc, page, pages, invoiceNo) {
  const y = 278;
  doc.setDrawColor(...GOLD);
  doc.setLineWidth(0.25);
  doc.line(LEFT, y, PAGE_W - LEFT, y);
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7.5);
  doc.setTextColor(...MUTED);
  doc.text('Thank you for shopping with Sudhaga.', LEFT, y + 4.5);
  doc.text('Computer-generated invoice. Amounts are in Indian Rupees (INR).', LEFT, y + 8.2);
  doc.text(`${invoiceNo}  ·  Page ${page} of ${pages}`, PAGE_W - LEFT, y + 8.2, { align: 'right' });
}

function fitLine(doc, text, maxWidth, size) {
  let current = size;
  doc.setFontSize(current);
  const value = String(text || '—');
  while (doc.getTextWidth(value) > maxWidth && current > 6.2) {
    current -= 0.3;
    doc.setFontSize(current);
  }
  return value;
}

function drawMetaBox(doc, x, y, w, h, label, value) {
  doc.setDrawColor(...INK);
  doc.setFillColor(...CREAM);
  doc.setLineWidth(0.3);
  doc.rect(x, y, w, h, 'FD');
  doc.setFillColor(...GOLD);
  doc.rect(x, y, w, 1.1, 'F');
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(6.4);
  doc.setTextColor(...MUTED);
  doc.text(label, x + 3.5, y + 6);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(...INK);
  const line = fitLine(doc, value, w - 7, 8.2);
  doc.text(line, x + 3.5, y + 11.6);
}

function measureRows(doc, rows, inner) {
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9);
  return rows.map((row) => ({
    label: row.label,
    lines: wrapped(doc, row.value, inner),
  }));
}

function partyHeight(prepared) {
  let height = 12;
  prepared.forEach((row) => {
    height += 7 + row.lines.length * 4.1;
  });
  return height + 2;
}

function drawPartyBox(doc, x, y, w, h, title, prepared) {
  doc.setDrawColor(...INK);
  doc.setLineWidth(0.4);
  doc.setFillColor(...WHITE);
  doc.rect(x, y, w, h, 'FD');
  doc.setFillColor(...INK);
  doc.rect(x, y, w, 8, 'F');
  doc.setFillColor(...GOLD);
  doc.rect(x, y + 8, w, 0.7, 'F');
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8);
  doc.setTextColor(...WHITE);
  doc.text(title, x + 4, y + 5.4);

  let cursor = y + 15;
  prepared.forEach((row) => {
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(6.4);
    doc.setTextColor(...MUTED);
    doc.text(row.label, x + 4, cursor);
    cursor += 4.2;
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(9);
    doc.setTextColor(...INK);
    row.lines.forEach((line) => {
      doc.text(line, x + 4, cursor);
      cursor += 4.1;
    });
    cursor += 2.4;
  });
}

function tableCols() {
  const index = 12;
  const qty = 16;
  const price = 36;
  const amount = 40;
  return [
    { label: '#', w: index, align: 'center' },
    { label: 'PRODUCT', w: CONTENT_W - index - qty - price - amount, align: 'left' },
    { label: 'QTY', w: qty, align: 'center' },
    { label: 'UNIT PRICE', w: price, align: 'right' },
    { label: 'AMOUNT', w: amount, align: 'right' },
  ];
}

function drawTableHeader(doc, x, y, cols) {
  const height = 8;
  const width = cols.reduce((sum, col) => sum + col.w, 0);
  doc.setFillColor(...INK);
  doc.rect(x, y, width, height, 'F');
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(7.2);
  doc.setTextColor(...GOLD);
  let cursor = x;
  cols.forEach((col, index) => {
    if (index > 0) {
      doc.setDrawColor(70, 62, 48);
      doc.setLineWidth(0.15);
      doc.line(cursor, y, cursor, y + height);
    }
    const pad = col.align === 'right' ? col.w - 2.2 : col.align === 'center' ? col.w / 2 : 2.2;
    doc.text(col.label, cursor + pad, y + 5.2, { align: col.align || 'left' });
    cursor += col.w;
  });
  return height;
}

function rowHeight(doc, name, colW) {
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8);
  const lines = wrapped(doc, name, colW - 4);
  return { lines, height: Math.max(10, lines.length * 4 + 5.5) };
}

function drawTableRow(doc, x, y, cols, cells, shaded) {
  const { lines, height } = rowHeight(doc, cells.name, cols[1].w);
  const width = cols.reduce((sum, col) => sum + col.w, 0);
  doc.setFillColor(...(shaded ? CREAM : WHITE));
  doc.rect(x, y, width, height, 'F');
  doc.setDrawColor(...LINE);
  doc.setLineWidth(0.15);
  doc.line(x, y + height, x + width, y + height);

  const values = [cells.no, lines, cells.qty, cells.price, cells.amount];
  let cursor = x;
  cols.forEach((col, index) => {
    if (index > 0) {
      doc.setDrawColor(...LINE);
      doc.line(cursor, y, cursor, y + height);
    }
    doc.setFont('helvetica', index === 1 || index === 4 ? 'bold' : 'normal');
    doc.setFontSize(8);
    doc.setTextColor(...INK);
    const content = values[index];
    if (Array.isArray(content)) {
      content.forEach((line, lineIndex) => {
        doc.text(line, cursor + 2.2, y + 5.2 + lineIndex * 4);
      });
    } else {
      const pad = col.align === 'right' ? col.w - 2.2 : col.align === 'center' ? col.w / 2 : 2.2;
      doc.text(String(content), cursor + pad, y + 6.1, { align: col.align || 'left' });
    }
    cursor += col.w;
  });
  return height;
}

function closeTable(doc, x, top, bottom, width) {
  doc.setDrawColor(...INK);
  doc.setLineWidth(0.4);
  doc.rect(x, top, width, Math.max(8, bottom - top));
}

function drawTotals(doc, x, y, w, bill) {
  const rows = [
    ['Subtotal', money(bill.subtotal)],
    ['Discount', bill.discount > 0 ? `-${money(bill.discount)}` : money(0)],
    ['Shipping', bill.shipping === 0 ? 'Free' : money(bill.shipping)],
    ['GST (18%)', money(bill.tax)],
  ];
  const height = 8 + rows.length * 7 + 12;
  doc.setDrawColor(...INK);
  doc.setFillColor(...WHITE);
  doc.setLineWidth(0.4);
  doc.rect(x, y, w, height, 'FD');
  doc.setFillColor(...CREAM);
  doc.rect(x + 0.4, y + 0.4, w - 0.8, 7.2, 'F');
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(7.4);
  doc.setTextColor(...INK);
  doc.text('AMOUNT SUMMARY', x + 4, y + 5.2);

  rows.forEach((row, index) => {
    const rowY = y + 14 + index * 7;
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8.5);
    doc.setTextColor(...MUTED);
    doc.text(row[0], x + 4, rowY);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(...(row[0] === 'Discount' && bill.discount > 0 ? [6, 95, 70] : INK));
    doc.text(row[1], x + w - 4, rowY, { align: 'right' });
  });

  const totalY = y + height - 10;
  doc.setFillColor(...INK);
  doc.rect(x, totalY, w, 10, 'F');
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8);
  doc.setTextColor(...GOLD);
  doc.text('TOTAL PAID', x + 4, totalY + 6.4);
  doc.setTextColor(...WHITE);
  doc.setFontSize(11);
  doc.text(money(bill.total), x + w - 4, totalY + 6.5, { align: 'right' });
  return height;
}

export function renderInvoice(doc, order, logo) {
  const items = orderItems(order);
  const bill = billOf(order, items);
  const customer = customerOf(order);
  const orderId = String(order.id || order._id || '');
  const invoiceNo = `INV-${(orderId || 'ORDER').slice(-8).toUpperCase()}`;
  const placedOn = order.date || '—';
  const units = items.reduce((sum, item) => sum + Number(item.qty || 0), 0);
  const cols = tableCols();

  doc.setProperties({
    title: `Sudhaga Invoice ${invoiceNo}`,
    subject: `Order ${orderId}`,
    author: 'Sudhaga',
    creator: 'Sudhaga',
  });

  doc.setFillColor(...BLACK);
  doc.rect(FRAME + 1.6, FRAME + 1.6, PAGE_W - (FRAME + 1.6) * 2, 32, 'F');
  doc.setFillColor(...GOLD);
  doc.rect(FRAME + 1.6, FRAME + 1.6, PAGE_W - (FRAME + 1.6) * 2, 1.7, 'F');

  if (logo?.dataUrl) {
    const logoH = 12.5;
    const logoW = Math.min(62, logoH * (logo.w / logo.h));
    doc.addImage(logo.dataUrl, 'PNG', LEFT, 16.5, logoW, logoH);
  } else {
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(18);
    doc.setTextColor(...WHITE);
    doc.text('Sudhaga', LEFT, 26);
  }

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(15);
  doc.setTextColor(...GOLD);
  doc.text('TAX INVOICE', PAGE_W - LEFT, 20, { align: 'right' });
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8);
  doc.setTextColor(232, 222, 196);
  doc.text(invoiceNo, PAGE_W - LEFT, 26, { align: 'right' });
  doc.setTextColor(186, 180, 170);
  doc.text(placedOn, PAGE_W - LEFT, 31, { align: 'right' });

  let y = 48;
  const metaW = (CONTENT_W - 6) / 3;
  [
    ['INVOICE NO.', invoiceNo],
    ['ORDER ID', orderId || '—'],
    ['STATUS', order.status || 'Pending'],
  ].forEach((entry, index) => {
    drawMetaBox(doc, LEFT + index * (metaW + 3), y, metaW, 16, entry[0], entry[1]);
  });
  y += 22;

  const gap = 4;
  const boxW = (CONTENT_W - gap) / 2;
  const inner = boxW - 8;
  const address = customer.address.length ? customer.address.join('\n') : 'Address not provided';
  const contact = [customer.phone, customer.email].filter(Boolean).join('\n') || '—';
  const paymentRows = [
    { label: 'ORDER ID', value: orderId || '—' },
    { label: 'PLACED ON', value: placedOn },
    { label: 'PAYMENT', value: paymentLabel(order) },
    { label: 'PAYMENT ID', value: order.paymentId || '—' },
  ];
  if (order.razorpayOrderId) paymentRows.push({ label: 'RAZORPAY ORDER', value: order.razorpayOrderId });
  if (order.coupon?.code) paymentRows.push({ label: 'COUPON', value: order.coupon.code });

  const leftRows = measureRows(doc, [
    { label: 'CUSTOMER', value: customer.name },
    { label: 'DELIVERY ADDRESS', value: address },
    { label: 'PHONE / EMAIL', value: contact },
  ], inner);
  const rightRows = measureRows(doc, paymentRows, inner);
  const partyH = Math.max(partyHeight(leftRows), partyHeight(rightRows));
  drawPartyBox(doc, LEFT, y, boxW, partyH, 'BILL TO / SHIP TO', leftRows);
  drawPartyBox(doc, LEFT + boxW + gap, y, boxW, partyH, 'ORDER DETAILS', rightRows);
  y += partyH + 8;

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8);
  doc.setTextColor(...INK);
  doc.text(
    `PRODUCTS   ${items.length} ${items.length === 1 ? 'item' : 'items'}   ·   ${units} ${units === 1 ? 'unit' : 'units'}`,
    LEFT,
    y
  );
  y += 3.5;

  let tableTop = y;
  y += drawTableHeader(doc, LEFT, y, cols);

  const rows = items.length
    ? items
    : [{ name: 'No products on this order', qty: 0, price: 0, empty: true }];

  rows.forEach((item, index) => {
    const measured = rowHeight(doc, item.name || 'Product', cols[1].w);
    if (y + measured.height > BOTTOM) {
      closeTable(doc, LEFT, tableTop, y, CONTENT_W);
      doc.addPage();
      y = 18;
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(8);
      doc.setTextColor(...INK);
      doc.text('PRODUCTS (CONTINUED)', LEFT, y);
      y += 3.5;
      tableTop = y;
      y += drawTableHeader(doc, LEFT, y, cols);
    }
    const qty = Number(item.qty || 0);
    const price = Number(item.price || 0);
    y += drawTableRow(
      doc,
      LEFT,
      y,
      cols,
      {
        no: item.empty ? '—' : String(index + 1),
        name: item.name || 'Product',
        qty: item.empty ? '—' : String(qty),
        price: item.empty ? '—' : money(price),
        amount: item.empty ? '—' : money(price * qty),
      },
      index % 2 === 1
    );
  });
  closeTable(doc, LEFT, tableTop, y, CONTENT_W);

  y += 6;
  const totalsW = 78;
  const totalsH = 8 + 4 * 7 + 12;
  if (y + totalsH > BOTTOM) {
    doc.addPage();
    y = 18;
  }
  const noteW = CONTENT_W - totalsW - 5;
  doc.setDrawColor(...INK);
  doc.setLineWidth(0.4);
  doc.setFillColor(...WHITE);
  doc.rect(LEFT, y, noteW, totalsH, 'FD');
  doc.setFillColor(...CREAM);
  doc.rect(LEFT + 0.4, y + 0.4, noteW - 0.8, 7.2, 'F');
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(7.4);
  doc.setTextColor(...INK);
  doc.text('NOTES', LEFT + 4, y + 5.2);
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8);
  doc.setTextColor(...MUTED);
  const notes = doc.splitTextToSize(
    'GST is charged at 18% on the taxable value after discount. Shipping is listed separately and is free above Rs. 999. Please quote the order ID if you contact support@sudhaga.com.',
    noteW - 8
  );
  doc.text(notes, LEFT + 4, y + 13);
  drawTotals(doc, LEFT + noteW + 5, y, totalsW, bill);

  const pages = doc.getNumberOfPages();
  for (let page = 1; page <= pages; page += 1) {
    doc.setPage(page);
    paintFrame(doc);
    paintFooter(doc, page, pages, invoiceNo);
  }
}

export async function downloadOrderInvoice(order, logo) {
  const doc = new jsPDF({ unit: 'mm', format: 'a4', compress: true });
  const mark = logo || (await loadImage('/brand/logo-dark.png'));
  renderInvoice(doc, order, mark);
  const orderId = String(order.id || order._id || 'order');
  doc.save(`Sudhaga-Invoice-${orderId}.pdf`);
}
