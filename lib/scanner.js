import { EventEmitter } from 'events';
import fs from 'fs/promises';
import path from 'path';

export class Scanner extends EventEmitter {

  async scan(directory) {
    const fullPathDir = path.resolve(directory);

    try {
      const statsOfDir = await fs.stat(fullPathDir);
      if (!statsOfDir.isDirectory()) {
        const notDirError = new Error(`Path is not a directory: ${directory}`);
        notDirError.code = 'ENOTDIR';
        notDirError.targetPath = directory;
        throw notDirError;
      }
    } catch (error) {
      error.targetPath = error.targetPath || directory;
      throw error;
    }
  
    this.emit('scan-start', { directory });

    let files;
    try {
      files = await fs.readdir(fullPathDir, { 
        withFileTypes: true, 
        recursive: true 
      });
    } catch (error) {
      error.targetPath = directory;
      throw error;
    }

    let totalFiles = 0;
    let totalDirectories = 0;
    let totalSize = 0;
    const extensions = {};
    let allFiles = [];
    let largestFiles;
    let oldestFile;
    let minAge = 0;
    const filesByAge = {
      "seven": 0,
      "thirty": 0,
      "ninety": 0,
      "more": 0
    }
    let current = 1;

    for (const file of files) {
      if (file.isDirectory()) {
        totalDirectories ++;
      }
      if (file.isFile()) {
        totalFiles ++;
        const fullPath = path.join(file.parentPath, file.name);

        let stats;
        try {
          stats = await fs.stat(fullPath);
        } catch (error) {
          this.emit('file-error', { path: fullPath, error });
        }
      
    
        totalSize += stats.size;

        // By File Type:
        const ext = path.extname(file.name).toLowerCase() || '(other)';
          if (!extensions[ext]) {
            extensions[ext] = { count: 0, size: 0 };
          }
          extensions[ext].count++;
          extensions[ext].size += stats.size;

        // File Age:
        const fileAgeInMs = Date.now() - stats.mtimeMs;

        const fileAgeInDays = Math.floor(fileAgeInMs / (1000 * 60 * 60 * 24));
        if (fileAgeInDays <= 7) {
          filesByAge["seven"] += 1;
        } else if (fileAgeInDays <= 30) {
          filesByAge["thirty"] += 1;
        } else if (fileAgeInDays <= 90) {
          filesByAge["ninety"] += 1;
        } else if (fileAgeInDays > 90) {
          filesByAge["more"] += 1;  
        }

        // Oldest file:
        if (fileAgeInMs > minAge) {
          minAge = fileAgeInMs;
          oldestFile = {name: file.name, path: fullPath, age: fileAgeInDays};
        }

        // Largest files:
        allFiles.push({
          name: file.name,
          path: fullPath,
          size: stats.size
        });

        this.emit('file-found', { 
          total: files.length - totalDirectories, 
          current: current });

        current += 1;
      }
    }

    allFiles.sort((a, b) => b.size - a.size);
    largestFiles = allFiles.slice(0, 3);

    const statistics = {
      directory,
      totalFiles,
      totalSize,
      extensions,
      largestFiles,
      filesByAge,
      oldestFile
    };

    this.emit('scan-complete', statistics);

    return statistics;
  }
}

export default Scanner;