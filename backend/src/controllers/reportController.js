const db = require("../config/database");

const escapeCsv = (val) => {
    if (val == null) return '""';
    const str = String(val).replace(/"/g, '""');
    return `"${str}"`;
};

const sendCsv = (res, filename, headers, rows) => {
    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);

    const headerRow = headers.map(escapeCsv).join(',') + '\n';
    const dataRows = rows.map(row => {
        return headers.map(header => escapeCsv(row[header])).join(',');
    }).join('\n');

    res.status(200).send(headerRow + dataRows);
};

exports.exportParticipants = (req, res, next) => {
    const sql = `
        SELECT 
            id as "Participant ID",
            first_name as "First Name",
            last_name as "Last Name",
            email as "Email",
            mobile as "Mobile",
            organization as "Organization",
            created_at as "Created At"
        FROM participants
        ORDER BY created_at DESC
    `;
    db.query(sql, [], (err, results) => {
        if (err) return next(err);
        const headers = ["Participant ID", "First Name", "Last Name", "Email", "Mobile", "Organization", "Created At"];
        sendCsv(res, 'participants.csv', headers, results);
    });
};

exports.exportRegistrations = (req, res, next) => {
    let sql = `
        SELECT 
            CONCAT(p.first_name, ' ', IFNULL(p.last_name, '')) as "Participant Name",
            p.email as "Email",
            p.mobile as "Mobile",
            p.organization as "Organization",
            r.registration_code as "Registration Code",
            r.status as "Registration Status",
            w.title as "Workshop",
            w.start_datetime as "Workshop Start",
            w.end_datetime as "Workshop End",
            w.registration_start as "Registration Start",
            w.registration_end as "Registration End",
            r.registered_at as "Registered At"
        FROM registrations r
        JOIN participants p ON r.participant_id = p.id
        JOIN workshops w ON r.workshop_id = w.id
        WHERE 1=1
    `;
    
    const params = [];
    if (req.query.workshop_id) {
        sql += " AND r.workshop_id = ?";
        params.push(req.query.workshop_id);
    }
    if (req.query.status) {
        sql += " AND r.status = ?";
        params.push(req.query.status);
    }
    
    sql += " ORDER BY r.registered_at DESC";

    db.query(sql, params, (err, results) => {
        if (err) return next(err);
        const headers = [
            "Participant Name", "Email", "Mobile", "Organization",
            "Registration Code", "Registration Status",
            "Workshop", "Workshop Start", "Workshop End",
            "Registration Start", "Registration End", "Registered At"
        ];
        sendCsv(res, 'registrations.csv', headers, results);
    });
};

exports.exportCheckins = (req, res, next) => {
    let sql = `
        SELECT 
            CONCAT(p.first_name, ' ', IFNULL(p.last_name, '')) as "Participant Name",
            p.email as "Email",
            p.mobile as "Mobile",
            r.registration_code as "Registration Code",
            w.title as "Workshop",
            w.start_datetime as "Workshop Start",
            w.end_datetime as "Workshop End",
            c.checked_in_at as "Checked In At",
            u.email as "Checked In By",
            c.checked_out_at as "Checked Out At",
            IF(c.checked_out_at IS NOT NULL, 
                ROUND(TIMESTAMPDIFF(MINUTE, c.checked_in_at, c.checked_out_at) / 60.0, 2), 
                ''
            ) as "Attended Hours"
        FROM checkins c
        JOIN registrations r ON c.registration_id = r.id
        JOIN participants p ON r.participant_id = p.id
        JOIN workshops w ON r.workshop_id = w.id
        LEFT JOIN users u ON c.checked_in_by = u.id
        WHERE 1=1
    `;
    
    const params = [];
    if (req.query.workshop_id) {
        sql += " AND r.workshop_id = ?";
        params.push(req.query.workshop_id);
    }

    sql += " ORDER BY c.checked_in_at DESC";

    db.query(sql, params, (err, results) => {
        if (err) return next(err);
        const headers = [
            "Participant Name", "Email", "Mobile",
            "Registration Code", "Workshop",
            "Workshop Start", "Workshop End",
            "Checked In At", "Checked In By",
            "Checked Out At", "Attended Hours"
        ];
        sendCsv(res, 'checkins.csv', headers, results);
    });
};
