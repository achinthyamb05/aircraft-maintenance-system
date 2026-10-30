import { NextResponse } from 'next/server';
import pool from '@/lib/db';
import crypto from 'crypto';

export async function POST(req) {
  try {
    const { username, password } = await req.json();

    if (!username || !password) {
      return NextResponse.json(
        { success: false, error: 'Username and password required.' },
        { status: 400 }
      );
    }

    const hash = crypto.createHash('sha256').update(password).digest('hex');

    const [rows] = await pool.query(
      'SELECT User_ID, Username, Full_Name, Role FROM APP_USER WHERE Username = ? AND Password_Hash = ?',
      [username, hash]
    );

    if (rows.length === 0) {
      return NextResponse.json(
        { success: false, error: 'Invalid username or password.' },
        { status: 401 }
      );
    }

    const user = rows[0];
    return NextResponse.json({
      success: true,
      user: {
        id: user.User_ID,
        username: user.Username,
        name: user.Full_Name,
        role: user.Role,
      },
    });
  } catch (err) {
    return NextResponse.json(
      { success: false, error: 'Database authentication error: ' + err.message },
      { status: 500 }
    );
  }
}
