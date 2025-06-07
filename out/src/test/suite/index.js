"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.run = run;
const path = require("path");
const Mocha = require("mocha");
const glob_1 = require("glob");
function run() {
    // Create the mocha test
    const mocha = new Mocha({
        ui: 'tdd',
        color: true,
        timeout: 10000
    });
    const testsRoot = path.resolve(__dirname, '..');
    return new Promise((c, e) => {
        // Use glob with callback
        (0, glob_1.glob)('**/**.test.js', { cwd: testsRoot }, (err, files) => {
            if (err) {
                return e(err);
            }
            // Add files to the test suite
            files.forEach((f) => mocha.addFile(path.resolve(testsRoot, f)));
            try {
                // Run the mocha test
                mocha.run((failures) => {
                    if (failures > 0) {
                        e(new Error(`${failures} tests failed.`));
                    }
                    else {
                        c();
                    }
                });
            }
            catch (err) {
                console.error(err);
                e(err);
            }
        });
    });
}
//# sourceMappingURL=index.js.map