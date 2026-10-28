import pool from '@/lib/db';

export async function POST(request) {
  try {
    const body = await request.json();
    const {
      maintenanceId,
      maintType = 'Routine Inspection',
      date = new Date().toISOString().split('T')[0],
      description,
      cost,
      status = 'Completed',
      hangarId = 1,
      aircraftId,
      technicianId = 1,
      partLogId,
      partId,
      quantityUsed,
      unitCost = 50.00
    } = body;

    // Direct invocation of the ACID Transactional Stored Procedure
    await pool.query(
      `CALL sp_log_maintenance_with_part(?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        Number(maintenanceId),
        maintType,
        date,
        description,
        Number(cost),
        status,
        Number(hangarId),
        Number(aircraftId),
        Number(technicianId),
        Number(partLogId),
        Number(partId),
        Number(quantityUsed),
        Number(unitCost)
      ]
    );

    return Response.json({ 
      success: true, 
      message: 'Record committed atomically via Stored Procedure!' 
    });
  } catch (error) {
    console.error('Maintenance Procedure Error:', error.message);
    return Response.json({ success: false, error: error.message }, { status: 400 });
  }
}