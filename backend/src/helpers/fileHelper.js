'use strict';

const config = require('configs/config');
const path = require('path');
const fs = require('fs');
const PathPointerHelper = require('helpers/pathPointerHelper');
const pathPointerHelper = new PathPointerHelper();

class fileHelper {
    
    read = (path) => {
        return new Promise((resolve, reject) => {
            // let data = '';
            let buffers = [];

            fs.createReadStream(path)
            .on('data', (chunk) => {
                // data += chunk;
                const buf = Buffer.from(chunk);
                buffers.push(chunk);
            })
            .on('end', () => {
                // return binary
                resolve(Buffer.concat(buffers));
            })
            .on('error', (err) => {
                reject(err);
            })
        })
    }

    writeStream = (path, data) => {
        return new Promise((resolve, reject) => {
            const options = {
                flags: 'a+'
            };
            let steam = fs.createWriteStream(path, options);

            steam.write(data + '\n');
            steam.end();
            steam.on('finish', () => { 
                resolve(true); 
            });
            steam.on('error', (err) => {
                reject(err);
            });
        });
    }

    mkdir = async (path) => {
        try {
            await fs.promises.mkdir(path, { recursive: true });
        } catch (err) {
            throw err;
        }
    }

    exists = (path) => {
        try {
            return fs.existsSync(path);
        } catch (err) {
            throw err;
        }
    }

    stat = async (path) => {
        try {
            return await fs.promises.stat(path);
        } catch (err) {
            throw err;
        }
    }

    write = async (path, data) => {
        try {
            await fs.promises.writeFile(path, data);
            return true;

        } catch (err) {
            throw err;
        }
    }

    deleteOne = async (path) => {
        try {
            let status = fs.existsSync(path);
            if (status) {
                await fs.promises.unlink(path);
            }
            return;
        } catch (err) {
            throw err;
        }
    }

    rename = async (newName, file) => {
        const rootPath = pathPointerHelper.getRootPath(true);
        const assertsPath = path.join(rootPath + config.upload.dir);
        let iteration = [];
        let data = {};

        let from, to, filename, extension = '';
        try {
            from = file.path;
            extension = path.extname(file.path);
            filename = `${newName}`;
            to = assertsPath + filename;
            iteration.push(fs.promises.rename(from, to));

            data = {
                name: filename,
                size: file.size
            };
            await Promise.all(iteration);
            return data;            
        } catch (err) {
            throw err;
        }
    }

    readdir = async (source) => {
        let result = { 
            folder: [], 
            file: [] 
        };

        this.parse = async (source) => {
            const folderExclude = ['__MACOSX'];
            const fileExclude = ['.DS_Store'];

            try {
                let files = await fs.promises.readdir(source);
                for (const item of files) {
                    let filePath = path.join(source, item);
                    let stat = fs.statSync(filePath);
                    if (stat.isDirectory() === true) {
                        if (!folderExclude.includes(item)) {
                            await this.parse(filePath);
                            result.folder.push(filePath);
                        }
                    }

                    if (stat.isFile() === true) {
                        if (!fileExclude.includes(item)) {
                            result.file.push(filePath);
                        }
                    }
                }
                return true;
            } catch (err) {
                throw err;
            }
        }
        
        await this.parse(source);
        return result;
    }
}

module.exports = fileHelper;
