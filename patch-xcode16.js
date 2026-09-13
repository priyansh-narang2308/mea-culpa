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

// 3. Fix Sendable conformances
function fixSendables() {
    const filesToPatch = [
        'Runtime/JavaScriptPropNameID.swift',
        'Runtime/Values/JavaScriptError.swift',
        'Runtime/Values/JavaScriptValue.swift'
    ];

    for (const relPath of filesToPatch) {
        const fullPath = path.join(jsiPath, 'ExpoModulesJSI', relPath);
        if (fs.existsSync(fullPath)) {
            let content = fs.readFileSync(fullPath, 'utf8');

            if (relPath.includes('JavaScriptPropNameID.swift')) {
                if (content.includes('public final class JavaScriptPropNameID: JavaScriptType {')) {
                    content = content.replace(
                        'public final class JavaScriptPropNameID: JavaScriptType {',
                        'public final class JavaScriptPropNameID: JavaScriptType, @unchecked Sendable {'
                    );
                    fs.writeFileSync(fullPath, content);
                    console.log('Patched JavaScriptPropNameID.swift with @unchecked Sendable');
                }
            }

            if (relPath.includes('JavaScriptError.swift')) {
                if (content.includes('public final class JavaScriptError: Error, Sendable {')) {
                    content = content.replace(
                        'public final class JavaScriptError: Error, Sendable {',
                        'public final class JavaScriptError: Error, @unchecked Sendable {'
                    );
                    fs.writeFileSync(fullPath, content);
                    console.log('Patched JavaScriptError.swift with @unchecked Sendable');
                }
            }

            if (relPath.includes('JavaScriptValue.swift')) {
                if (!content.includes('@unchecked Sendable')) {
                    content = content.replace(
                        'public final class JavaScriptValue: JavaScriptType, Equatable, Escapable {',
                        'public final class JavaScriptValue: JavaScriptType, Equatable, Escapable, @unchecked Sendable {'
                    );
                    content = content.replace(
                        'public final class JavaScriptValue: JavaScriptType, Equatable {',
                        'public final class JavaScriptValue: JavaScriptType, Equatable, @unchecked Sendable {'
                    );
                    fs.writeFileSync(fullPath, content);
                    console.log('Patched JavaScriptValue.swift with @unchecked Sendable');
                }
            }
        }
    }
}

// 4. Fix Swift 6 concurrency closures in JavaScriptRuntime.swift
function fixJavaScriptRuntime() {
    const runtimePath = path.join(jsiPath, 'ExpoModulesJSI', 'Runtime', 'JavaScriptRuntime.swift');
    if (!fs.existsSync(runtimePath)) return;

    let content = fs.readFileSync(runtimePath, 'utf8');

    // Add UnsafeSendableWrapper definition if missing
    if (!content.includes('struct UnsafeSendableWrapper')) {
        const wrapperDef = `
struct UnsafeSendableWrapper<T>: @unchecked Sendable {
  let value: T
}
`;
        content = content.replace(/(internal import jsi\r?\n)/, '$1' + wrapperDef);
        console.log('Added UnsafeSendableWrapper to JavaScriptRuntime.swift');
    }

    // Patch 1: getter resultPtr
    const block1 = `        return JavaScriptActor.assumeIsolated {
          return forwardingSwiftErrorsToJS(runtime: runtime) {
            try context.get(propertyName).writeJSIValue(to: resultPtr)
          }
        }`;
    const newBlock1 = `        let resultPtrBox = UnsafeSendableWrapper(value: resultPtr)
        return JavaScriptActor.assumeIsolated {
          let resultPtr = resultPtrBox.value
          return forwardingSwiftErrorsToJS(runtime: runtime) {
            try context.get(propertyName).writeJSIValue(to: resultPtr)
          }
        }`;
    if (content.includes(block1)) {
        content = content.replace(block1, newBlock1);
        console.log('Patched block 1 in JavaScriptRuntime.swift');
    }

    // Patch 2: call with this, arguments, result
    const block2 = `      return JavaScriptActor.assumeIsolated {
        return forwardingSwiftErrorsToJS(runtime: runtime) {
          let this = UnsafeMutablePointer(mutating: thisPtr).move()
          let arguments = JavaScriptValuesBuffer(runtime, start: argumentsPtr, count: argumentsCount)
          let thisValue = JavaScriptValue(runtime, this)
          try context.call(thisValue, consume arguments).writeJSIValue(to: resultPtr)
        }
      }`;
    const newBlock2 = `      let thisPtrBox = UnsafeSendableWrapper(value: thisPtr)
      let argumentsPtrBox = UnsafeSendableWrapper(value: argumentsPtr)
      let resultPtrBox = UnsafeSendableWrapper(value: resultPtr)
      return JavaScriptActor.assumeIsolated {
        let thisPtr = thisPtrBox.value
        let argumentsPtr = argumentsPtrBox.value
        let resultPtr = resultPtrBox.value
        return forwardingSwiftErrorsToJS(runtime: runtime) {
          let this = UnsafeMutablePointer(mutating: thisPtr).move()
          let arguments = JavaScriptValuesBuffer(runtime, start: argumentsPtr, count: argumentsCount)
          let thisValue = JavaScriptValue(runtime, this)
          try context.call(thisValue, consume arguments).writeJSIValue(to: resultPtr)
        }
      }`;
    if (content.includes(block2)) {
        content = content.replace(block2, newBlock2);
        console.log('Patched block 2 in JavaScriptRuntime.swift');
    }

    // Patch 3: unowned this call
    const block3 = `      return JavaScriptActor.assumeIsolated {
        return forwardingSwiftErrorsToJS(runtime: runtime) {
          let arguments = JavaScriptValuesBuffer(runtime, start: argumentsPtr, count: argumentsCount)
          let thisValue = JavaScriptUnownedValue(runtime.pointee, thisPtr)
          try context.call(thisValue, consume arguments).writeJSIValue(to: resultPtr)
        }
      }`;
    const newBlock3 = `      let thisPtrBox = UnsafeSendableWrapper(value: thisPtr)
      let argumentsPtrBox = UnsafeSendableWrapper(value: argumentsPtr)
      let resultPtrBox = UnsafeSendableWrapper(value: resultPtr)
      return JavaScriptActor.assumeIsolated {
        let thisPtr = thisPtrBox.value
        let argumentsPtr = argumentsPtrBox.value
        let resultPtr = resultPtrBox.value
        return forwardingSwiftErrorsToJS(runtime: runtime) {
          let arguments = JavaScriptValuesBuffer(runtime, start: argumentsPtr, count: argumentsCount)
          let thisValue = JavaScriptUnownedValue(runtime.pointee, thisPtr)
          try context.call(thisValue, consume arguments).writeJSIValue(to: resultPtr)
        }
      }`;
    if (content.includes(block3)) {
        content = content.replace(block3, newBlock3);
        console.log('Patched block 3 in JavaScriptRuntime.swift');
    }

    fs.writeFileSync(runtimePath, content);
}

fixWeakLet(path.join(jsiPath, 'ExpoModulesJSI'));
fixRuntimeScheduler();
fixSendables();
fixJavaScriptRuntime();

console.log('All Xcode 16 / Swift 6 patches applied successfully!');
