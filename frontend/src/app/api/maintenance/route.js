import { NextResponse } from 'next/server';
import pool from '@/lib/db';

export async function POST(req) {
  try {
    const body = await req.json();
    const {
      maintenanceId,
      maintType,
      date,
      description,
      cost,
      status,
      hangarId,
      aircraftId,
      technicianId,
      partLogId,
      partId,
      quantityUsed,
      userRole,
    } = body;

    // RBAC Security Gate: Disallow non-admin executions
    if (userRole !== 'Admin') {
      return NextResponse.json(
        {
          success: false,
          error: 'Access Denied: Only users with System Admin privileges can execute transactional work orders.',
        },
        { status: 403 }
      );
    }

    const [results] = await pool.query(
      'CALL sp_log_maintenance_with_part(?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',
      [
        parseInt(maintenanceId),
        maintType,
        date,
        description,
        parseFloat(cost),
        status,
        parseInt(hangarId),
        parseInt(aircraftId),
        parseInt(technicianId),
        parseInt(partLogId),
        parseInt(partId),
        parseInt(quantityUsed),
      ]
    );

    return NextResponse.json({
      success: true,
      message: 'Atomic Stored Procedure executed successfully.',
      data: results,
    });
  } catch (err) {
    return NextResponse.json(
      { success: false, error: err.message },
      { status: 500 }
    );
  }
}
