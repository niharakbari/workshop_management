const db = require("../config/database");
const asyncHandler = require("../utils/asyncHandler");

exports.getStats = asyncHandler(async (req, res, next) => {
    // 1. Get total and active workshops
    const workshopQuery = `
        SELECT 
            COUNT(*) as totalWorkshops,
            SUM(CASE WHEN end_datetime > NOW() THEN 1 ELSE 0 END) as activeWorkshops
        FROM workshops
    `;

    // 2. Get total participants
    const participantQuery = `SELECT COUNT(*) as totalParticipants FROM participants`;

    // 3. Get total registrations
    const registrationQuery = `SELECT COUNT(*) as totalRegistrations FROM registrations`;

    // 4. Get total check-ins
    const checkinQuery = `SELECT COUNT(*) as totalCheckIns FROM checkins`;

    // 5. Get recent activity (Top 5 Check-ins + Top 5 Registrations, ordered by date)
    const recentActivityQuery = `
        (
            SELECT 
                'CHECKIN' as type, 
                p.first_name, 
                p.last_name, 
                w.title as workshop, 
                c.checked_in_at as date
            FROM checkins c 
            JOIN registrations r ON c.registration_id = r.id
            JOIN participants p ON r.participant_id = p.id
            JOIN workshops w ON r.workshop_id = w.id
            ORDER BY c.checked_in_at DESC
            LIMIT 5
        )
        UNION ALL
        (
            SELECT 
                'REGISTRATION' as type, 
                p.first_name, 
                p.last_name, 
                w.title as workshop, 
                r.registered_at as date
            FROM registrations r
            JOIN participants p ON r.participant_id = p.id
            JOIN workshops w ON r.workshop_id = w.id
            ORDER BY r.registered_at DESC
            LIMIT 5
        )
        ORDER BY date DESC
        LIMIT 5
    `;

    // Execute all queries in parallel using Promises
    const executeQuery = (query) => {
        return new Promise((resolve, reject) => {
            db.query(query, (err, results) => {
                if (err) return reject(err);
                resolve(results);
            });
        });
    };

    const checkinOverviewQuery = `
        SELECT 
            w.title as workshop,
            w.status,
            w.capacity as total_capacity,
            GREATEST(0, w.capacity - COUNT(DISTINCT CASE WHEN r.status != 'CANCELLED' THEN r.id ELSE NULL END)) as available_capacity,
            w.start_datetime as workshop_start,
            w.end_datetime as workshop_end,
            COUNT(DISTINCT c.id) as total_checked_in,
            SUM(CASE WHEN c.id IS NOT NULL AND c.checked_out_at IS NULL THEN 1 ELSE 0 END) as currently_present,
            SUM(CASE WHEN c.id IS NOT NULL AND c.checked_out_at IS NOT NULL THEN 1 ELSE 0 END) as checked_out
        FROM workshops w
        LEFT JOIN registrations r ON w.id = r.workshop_id
        LEFT JOIN checkins c ON r.id = c.registration_id
        GROUP BY w.id, w.title, w.status, w.capacity, w.start_datetime, w.end_datetime
        ORDER BY w.start_datetime DESC
    `;

    const operationalStatsQuery = `
        SELECT 
            SUM(CASE WHEN start_datetime <= NOW() AND end_datetime >= NOW() THEN 1 ELSE 0 END) as ongoing,
            SUM(CASE WHEN start_datetime > NOW() THEN 1 ELSE 0 END) as upcoming,
            SUM(CASE WHEN status = 'CANCELLED' THEN 1 ELSE 0 END) as cancelled,
            SUM(CASE WHEN status = 'OPEN' AND registration_start <= NOW() AND registration_end >= NOW() THEN 1 ELSE 0 END) as openForRegistration,
            SUM(CASE WHEN registration_start <= NOW() AND registration_end >= NOW() THEN 1 ELSE 0 END) as registrationPhase,
            SUM(CASE WHEN end_datetime < NOW() THEN 1 ELSE 0 END) as completed
        FROM workshops
    `;

    const [
        workshopStats,
        participantStats,
        registrationStats,
        checkinStats,
        recentActivity,
        checkinOverview,
        operationalStats
    ] = await Promise.all([
        executeQuery(workshopQuery),
        executeQuery(participantQuery),
        executeQuery(registrationQuery),
        executeQuery(checkinQuery),
        executeQuery(recentActivityQuery),
        executeQuery(checkinOverviewQuery),
        executeQuery(operationalStatsQuery)
    ]);

    const stats = {
        totalWorkshops: workshopStats[0].totalWorkshops || 0,
        activeWorkshops: workshopStats[0].activeWorkshops || 0,
        totalParticipants: participantStats[0].totalParticipants || 0,
        totalRegistrations: registrationStats[0].totalRegistrations || 0,
        totalCheckIns: checkinStats[0].totalCheckIns || 0,
        recentActivity: recentActivity || [],
        checkinOverview: checkinOverview || [],
        operationalStats: operationalStats[0] || {}
    };

    res.status(200).json({
        status: 'success',
        data: stats
    });
});
