import pool from '@/lib/db';

export async function GET() {
  try {
    const [rows] = await pool.query('SELECT * FROM view_aircraft_maintenance_summary ORDER BY Maintenance_Date DESC');
    return Response.json({ success: true, data: rows });
  } catch (error) {
    return Response.json({ success: false, error: error.message }, { status: 500 });
  }
}