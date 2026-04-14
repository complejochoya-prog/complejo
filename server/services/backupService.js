const cron = require("node-cron");
const { exec } = require("child_process");
const path = require("path");
const fs = require("fs");

const backupFolder = path.join(__dirname, "../backups");

// Ensure backup folder exists (redundancy)
if (!fs.existsSync(backupFolder)) {
    fs.mkdirSync(backupFolder, { recursive: true });
}

/**
 * Generates a compressed database backup using mongodump.
 * Scheduled for 03:00 AM daily.
 */
cron.schedule("0 3 * * *", () => {
    const fileName = `backup-${Date.now()}.gz`;
    const filePath = path.join(backupFolder, fileName);

    const command = `mongodump --archive="${filePath}" --gzip`;

    exec(command, (error, stdout, stderr) => {
        if (error) {
            console.error(`[Backup] Error generating backup: ${error.message}`);
            return;
        }
        console.log(`[Backup] Automatic backup generated: ${fileName}`);
    });
});

/**
 * Cleans up backups older than 7 days.
 * Scheduled for 04:00 AM daily.
 */
function limpiarBackups() {
    console.log("[Backup] Starting cleanup of old backups...");
    fs.readdir(backupFolder, (err, files) => {
        if (err) {
            console.error(`[Backup] Error reading backup directory: ${err.message}`);
            return;
        }

        files.forEach(file => {
            const filePath = path.join(backupFolder, file);
            const stats = fs.statSync(filePath);

            const now = Date.now();
            const ageInMs = now - stats.mtime.getTime();
            const ageInDays = ageInMs / (1000 * 60 * 60 * 24);

            if (ageInDays > 7) {
                fs.unlinkSync(filePath);
                console.log(`[Backup] Deleted old backup: ${file}`);
            }
        });
    });
}

cron.schedule("0 4 * * *", limpiarBackups);

module.exports = {
    backupFolder,
    limpiarBackups
};
