import { NextResponse } from 'next/server';
export const json = (data, status = 200) => NextResponse.json(data, { status });
export const fail = (message, status = 400) => NextResponse.json({ error: message }, { status });
