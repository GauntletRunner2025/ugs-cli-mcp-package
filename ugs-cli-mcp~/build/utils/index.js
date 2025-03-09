import * as fs from 'fs';
import * as path from 'path';
/**
 * Log file type enum
 */
export var LogType;
(function (LogType) {
    LogType["STDOUT"] = "stdout";
    LogType["STDERR"] = "stderr";
    LogType["INFO"] = "info";
})(LogType || (LogType = {}));
/**
 * Write data to the appropriate log file based on log type
 */
export const writeToLog = async (data, logType = LogType.INFO) => {
    try {
        // Use a relative path from the current working directory (where the MCP server is run)
        const logDir = path.join(process.cwd(), 'logs');
        const logFile = path.join(logDir, `${logType}.log`);
        if (!fs.existsSync(logDir)) {
            fs.mkdirSync(logDir, { recursive: true });
        }
        const logEntry = `${JSON.stringify(data, null, 2)}\n`;
        await fs.promises.appendFile(logFile, logEntry);
        return true;
    }
    catch (error) {
        console.error('Error writing to log:', error);
        return false;
    }
};
