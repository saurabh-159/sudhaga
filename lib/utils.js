import { NextResponse } from 'next/server';

export function ok(data, status = 200) {
  return NextResponse.json({ success: true, data }, { status });
}

export function err(message, status = 400) {
  return NextResponse.json({ success: false, message }, { status });
}

export function catchErr(e) {
  const status = e.message === 'Unauthorized' ? 401 : e.message === 'Forbidden' ? 403 : 500;
  return err(e.message || 'Server error', status);
}