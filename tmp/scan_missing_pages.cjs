const fs = require('fs');
const path = require('path');

const rootDir = process.cwd();
const modulesDir = path.join(rootDir, 'src', 'modules');

function scanModules() {
    const missingFiles = [];
    if (!fs.existsSync(modulesDir)) {
        console.error("Modules directory not found at: " + modulesDir);
        return [];
    }

    const modules = fs.readdirSync(modulesDir);

    for (const moduleName of modules) {
        const modulePath = path.join(modulesDir, moduleName);
        if (!fs.statSync(modulePath).isDirectory()) continue;

        const indexPath = path.join(modulePath, 'index.jsx');
        if (!fs.existsSync(indexPath)) {
            // console.log(`Module ${moduleName} is missing index.jsx`);
            continue;
        }

        try {
            const content = fs.readFileSync(indexPath, 'utf-8');
            const importRegex = /import\s+(\w+)\s+from\s+['"](\.\/.*?)['"]/g;
            let match;

            while ((match = importRegex.exec(content)) !== null) {
                const componentName = match[1];
                const importPath = match[2];
                const targetPath = path.join(modulePath, importPath.replace(/^\.\//, ''));
                
                let found = false;
                for (const ext of ['.jsx', '.js', '.tsx', '.ts']) {
                    if (fs.existsSync(targetPath + ext)) {
                        found = true;
                        break;
                    }
                }

                if (!found) {
                    missingFiles.push({
                        module: moduleName,
                        component: componentName,
                        path: targetPath + '.jsx'
                    });
                }
            }
        } catch (err) {
            console.error(`Error reading ${indexPath}: ${err.message}`);
        }
    }
    return missingFiles;
}

try {
    const missing = scanModules();
    if (missing.length === 0) {
        process.stdout.write("SUCCESS_NO_MISSING");
    } else {
        process.stdout.write("FOUND_MISSING_FILES:\n");
        missing.forEach(m => {
            process.stdout.write(`${m.path} | ${m.module} | ${m.component}\n`);
        });
    }
} catch (e) {
    process.stderr.write("CRITICAL_ERROR: " + e.message + "\n");
}
