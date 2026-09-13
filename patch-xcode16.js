const fs = require('fs');
const path = require('path');

const jsiPath = path.join(__dirname, 'node_modules', 'expo-modules-jsi', 'apple', 'Sources');

// 1. Fix 'weak let' -> 'weak var' in Swift files
function fixWeakLet(dir) {
    if (!fs.existsSync(dir)) return;
    const files = fs.readdirSync(dir);
    for (const file of files) {
        const fullPath = path.join(dir, file);
        if (fs.statSync(fullPath).isDirectory()) {
            fixWeakLet(fullPath);
        } else if (fullPath.endsWith('.swift')) {
            let content = fs.readFileSync(fullPath, 'utf8');
            if (content.includes('weak let')) {
                content = content.replace(/weak let/g, 'weak var');
                fs.writeFileSync(fullPath, content);
                console.log(`Fixed weak let in: ${file}`);
            }
        }
    }
}

// 2. Fix SWIFT_RETURNS_RETAINED in RuntimeScheduler.h
function fixRuntimeScheduler() {
    const headerPath = path.join(jsiPath, 'ExpoModulesJSI-Cxx', 'include', 'RuntimeScheduler.h');
    if (fs.existsSync(headerPath)) {
        let content = fs.readFileSync(headerPath, 'utf8');
        if (content.includes('SWIFT_RETURNS_RETAINED')) {
            content = content.replace(/SWIFT_RETURNS_RETAINED /g, '');
            fs.writeFileSync(headerPath, content);
            console.log('Fixed SWIFT_RETURNS_RETAINED in RuntimeScheduler.h');
        }
    }
}

fixWeakLet(path.join(jsiPath, 'ExpoModulesJSI'));
fixRuntimeScheduler();

console.log('Patching complete!');
