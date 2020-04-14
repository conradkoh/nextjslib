//Scan and install all dependencies
let fs = require('fs');
let path = require('path');
const lib = require('./lib').modules;
let { execSync } = require('child_process');
async function main() {
    try {
        const dirroot = getNextJsLibRoot();
        const project_root = getProjectRoot();

        const nextjslib_manifest_filepath = path.join(dirroot, '/nextjslib.json');
        let nextjslib_manifest_content_raw = fs
            .readFileSync(nextjslib_manifest_filepath)
            .toString();
        const nextjslib_manifest_content = JSON.parse(nextjslib_manifest_content_raw);
        const nextjslib_dependencies = nextjslib_manifest_content.dependencies;

        const project_manifest_filepath = path.join(project_root, '/package.json');
        let project_manifest_content_raw = fs.readFileSync(project_manifest_filepath).toString();
        const project_manifest_content = JSON.parse(project_manifest_content_raw);
        const project_dependencies = project_manifest_content.dependencies;

        let modules = await lib.getModules(dirroot);
        for (let module_name of modules) {
            let project_version = project_dependencies[module_name];
            if (!project_version) {
                console.log(
                    `Warning: package.json does not contain the module '${module_name}'. Skipping...`
                );
                continue;
            }
            let nextjslib_version = nextjslib_dependencies[module_name];
            if (!nextjslib_version) {
                let new_version = project_dependencies[module_name];
                nextjslib_dependencies[module_name] = new_version;
                console.log(
                    `Added '${module_name}' with version '${new_version}' to nextjslib.json`
                );
            } else {
                //NextJsLib Version is already defined
                const old_version = nextjslib_dependencies[module_name];
                const new_version = project_dependencies[module_name];
                console.log(`Updated '${module_name}' from '${old_version}' to  '${new_version}'`);
            }
        }

        //Update nextjslib manifest
        nextjslib_manifest_content.dependencies = nextjslib_dependencies;
        fs.writeFileSync(
            nextjslib_manifest_filepath,
            JSON.stringify(nextjslib_manifest_content, null, 4)
        );
    } catch (err) {
        console.error(err.message);
        throw new Error(`commit.js: failed to commit`);
    }

    // let src = await lib.getFileFromDir(dirroot);
    // let item = (await src.next()).value;
    // let modules = {};
    // while (item) {
    //     let file_content = fs.readFileSync(item).toString();
    //     let cur_mods = lib.getFileImports(file_content);
    //     for (let mod of cur_mods) {
    //         modules[mod] = 1;
    //     }

    //     //Update state
    //     item = (await src.next()).value;
    // }
    // let command = `npm install ${Object.keys(modules).join(' ')}`;
    // console.log('Installing...');
    // console.log(command);
    // execSync(command, { cwd: __dirname, stdio: 'inherit' });
    // console.log('Done!');
}
main();

//Functions
/**
 * Get the root folder to be scanned
 */
function getNextJsLibRoot() {
    let dirroot = path.resolve(__dirname, '../');
    return dirroot;
}

function getProjectRoot() {
    let dirroot = path.resolve(__dirname, '../../');
    return dirroot;
}

// /**
//  * Recursively generate all the files in the directory, depth first
//  * @param {string} dirroot
//  * @param {ScanOptions} [options]
//  */
// async function* getFileFromDir(dirroot, options) {
//     options = options ? options : getDefaultOptions();
//     let ignore = options.ignore ? options.ignore : getDefaultIgnore();
//     let items = await new Promise((resolve, reject) => {
//         fs.readdir(dirroot, (err, files) => {
//             err ? reject(new Error('Failed to get files')) : resolve(files);
//         });
//     });
//     for (let item of items) {
//         let fpath = path.join(dirroot, `/${item}`);
//         let stat = await new Promise((resolve, reject) => {
//             fs.lstat(fpath, (err, stat) => {
//                 err ? reject(new Error('Failed to get stats')) : resolve(stat);
//             });
//         });
//         if (stat.isDirectory()) {
//             let src = await getFileFromDir(fpath, options);
//             let curItem = (await src.next()).value;
//             while (curItem) {
//                 yield curItem;
//                 curItem = (await src.next()).value;
//             }
//         } else {
//             if (ignore[item]) {
//                 continue;
//             }
//             yield fpath;
//         }
//     }
// }
// /**
//  *
//  */
// function getDefaultOptions() {
//     return {
//         ignore: getDefaultIgnore(),
//     };
// }
// /**
//  * @returns {*}
//  */
// function getDefaultIgnore() {
//     return {
//         '.git': true,
//         '.': true,
//         '..': true,
//     };
// }

// function getFileImports(content) {
//     let regex = /(?<=import [^\s]+ from ')([^^()\[\]\{\}';.\s\n]+)(?=')/g;
//     let matches = regex.exec(content);
//     let imports = [];
//     if (matches) {
//         for (let match of matches) {
//             if (!match) {
//                 continue; //Prevent empty entries
//             }
//             if (match[0] === '.') {
//                 continue;
//             }
//             let module_name = '';
//             let match_components = match.split('/');
//             if (match[0] === '@') {
//                 //Detect organization packages
//                 module_name = `${match_components[0]}/${match_components[1]}`;
//             } else {
//                 module_name = `${match_components[0]}`;
//             }
//             if (!module_name) {
//                 continue;
//             }
//             if (module_name[0] === '.') {
//                 continue; //Prevent first chars
//             }
//             if (module_name.toLowerCase() != module_name) {
//                 continue; //Prevent upper case characters
//             }
//             imports.push(module_name);
//         }
//     }
//     return imports;
// }

// /**
//  * @typedef ScanOptions
//  * @property {Object<string, boolean>} ignore
//  */