import { EventEmitter } from 'events';
import fsPromises from 'fs/promises';
import path from 'path';
import calculateHash from './helpers/calculateHash.js';

export class DuplicateFinder extends EventEmitter {

  async findDuplicates(directory) {
    const fullPathDir = path.resolve(directory);
    const dirName = path.basename(fullPathDir);

    try {
      const dirStats = await fsPromises.stat(fullPathDir);
      if (!dirStats.isDirectory()) {
        const notDirError = new Error(`Path is not a directory: ${fullPathDir}`);
        notDirError.code = 'ENOTDIR';
        notDirError.targetPath = fullPathDir;
        throw notDirError;
      }
    } catch (error) {
      error.targetPath = error.targetPath || fullPathDir;
      throw error;
    }

    this.emit('search-start', { directory });

    let files;
    try {
      files = await fsPromises.readdir(fullPathDir, { 
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
    let current = 1;
    let duplicateGroups = [];
    let totalWastedSpace = 0;
    const hashToPathsMap = new Map();
    const hashToDetailsMap = new Map();

    for (const file of files) {
      if (file.isDirectory()) {
        totalDirectories ++;
      }
      if (file.isFile()) {
        totalFiles ++;
        const displayPath = path.join(file.parentPath, file.name);
        const fullPath = path.resolve(displayPath);

        let stats;
        try {
          stats = await fsPromises.stat(fullPath);
        } catch (error) {
          this.emit('file-error', { path: fullPath, error });
        }

        try {
          const hash = await calculateHash(fullPath);

          const existingPaths = hashToPathsMap.get(hash) || [];
          existingPaths.push(displayPath);
          hashToPathsMap.set(hash, existingPaths);

          const existingDetails = hashToDetailsMap.get(hash) || [];
          existingDetails.push({
            fullPath,
            relativePath: stats.path,
            displayPath,
            size: stats.size,
          });
          hashToDetailsMap.set(hash, existingDetails);

          this.emit('file-processed', {
            total: files.length - totalDirectories, 
            current: current 
          });
          current += 1;
        } catch (error) {
          this.emit('file-error', { path: fullPath, error });
        }
      }
    }

    for (const [hash, filePaths] of hashToPathsMap.entries()) {
      if (filePaths.length > 1) {
        const details = hashToDetailsMap.get(hash);
        const fileSize = details[0].size;
        const wastedSpace = fileSize * (filePaths.length - 1);
        totalWastedSpace += wastedSpace;

        duplicateGroups.push({
          hash,
          copies: filePaths.length,
          sizeEach: fileSize,
          wastedSpace,
          files: filePaths,
          fullPaths: details.map((d) => d.fullPath),
        });
      }
    }

    duplicateGroups.sort((a, b) => b.wastedSpace - a.wastedSpace);

    const results = {
      directory,
      totalFiles,
      duplicateGroups,
      totalGroups: duplicateGroups.length,
      totalWastedSpace,
    };

    this.emit('duplicates-found', results);
    return results;
  }
}

export default DuplicateFinder;