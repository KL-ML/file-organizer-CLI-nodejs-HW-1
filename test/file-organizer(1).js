import path from 'path';

import formatSize from './lib/helpers/formatSize.js';
import drawProgressBar from './lib/helpers/drawProgressBar.js';
import errorFsHandler from './lib/helpers/errorFsHandler.js';
import parseDays from './lib/helpers/parseDays.js';

import printScanResult from './lib/printResultFunctions/printScanResult.js';

import { Command, InvalidArgumentError } from 'commander';
import { Scanner } from './lib/scanner.js';
import { DuplicateFinder } from './lib/duplicates.js';
import { Organizer } from './lib/organizer.js';
import { Cleanup } from './lib/cleanup.js';
import printDuplicatesResult from './lib/printResultFunctions/printDuplicatesResult.js';



const SEPARATOR = '━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━';

/**
 * Форматує дату у вигляді YYYY-MM-DD.
 * @param {Date} date - Об'єкт дати
 * @returns {string} Відформатована дата
 */
function formatDate(date) {
  return date.toISOString().split('T')[0];
}


async function runScan(directory) {
  const scanner = new Scanner();

  scanner.on('scan-start', (data) => {
    console.log(`📂 Scanning: ${data.directory}`);
  });

  scanner.on('file-found', (data) => {
      process.stdout.write(`\rProcessing... ${drawProgressBar(data.current, data.total)} files`)
    });

  scanner.on('file-error', ({ path: filePath, error }) => {
    console.error(`\n⚠️ Warning: Could not read file ${filePath}: ${error.message}`);
  });

  scanner.on('scan-complete', (stats) => {
      printScanResult(stats);
  });

  try {
    await scanner.scan(directory);
  } catch (error) {
    errorFsHandler(error, directory)
  }
}

/**
 * Виконує команду duplicates
 * @param {string} directory - Цільова директорія
 */
async function runDuplicates(directory) {
  const finder = new DuplicateFinder();

  finder.on('search-start', (data) => {
    console.log(`🔍 Searching for duplicates in: ${data.directory}`);
  });

  finder.on('file-processed', (data) => {
    process.stdout.write(
      `\rCalculating hashes... ${drawProgressBar(data.current, data.total)} files`
    );
  });

  finder.on('file-error', ({ path: filePath, error }) => {
    console.error(`\n⚠️ Warning: Could not process file ${filePath}: ${error.message}`);
  });

  finder.on('duplicates-found', (results) => {
    printDuplicatesResult(results);
  });

  try {
    await finder.findDuplicates(directory);
  } catch (error) {
    errorFsHandler(error, directory);
  }
}

/**
 * Виконує команду organize
 * @param {string} sourceDir - Вихідна директорія
 * @param {string} targetDir - Цільова директорія
 */
async function runOrganize(sourceDir, targetDir) {
  const organizer = new Organizer();
  let foldersHeaderPrinted = false;

  organizer.on('organize-start', (data) => {
    console.log(`📦 Organizing: ${data.sourceDir}`);
    console.log(`Target: ${data.targetDir}\n`);
    console.log('Creating folders...');
    foldersHeaderPrinted = true;
  });

  organizer.on('folder-created', ({ category }) => {
    if (foldersHeaderPrinted) {
      console.log(`✓ ${category}/`);
    }
  });

  organizer.on('copy-start', ({ current }) => {
    if (current === 1) {
      console.log('');
    }
  });

  organizer.on('copy-complete', (data) => {
    process.stdout.write(`\rCopying files... ${drawProgressBar(data.current, data.total)}`);
  });

  organizer.on('copy-error', ({ sourcePath, error }) => {
    console.error(`\n❌ Error copying ${sourcePath}: ${error.message}`);
  });

  organizer.on('organize-complete', (result) => {
    if (result.totalFiles === 0) {
      console.log('');
      process.stdout.write(`Copying files... ${drawProgressBar(0, 0)}`);
    }
    console.log('\n\n✅ Organization complete!\n');
    console.log('Summary:');

    const targetBaseName = path.basename(path.resolve(result.targetDir));
    for (const [category, count] of Object.entries(result.summary)) {
      const catLabel = `${category}:`.padEnd(11, ' ');
      const countLabel = `${count} files`.padEnd(10, ' ');
      console.log(`${catLabel} ${countLabel} → ${targetBaseName}/${category}/`);
    }

    console.log(`\nTotal copied: ${result.totalCopied} files (${formatSize(result.totalSize)})`);
  });

  try {
    await organizer.organize(sourceDir, targetDir);
  } catch (error) {
    errorFsHandler(error, sourceDir);
  }
}

/**
 * Виконує команду cleanup
 * @param {string} directory - Цільова директорія
 * @param {number} olderThan - Поріг віку файлів у днях
 * @param {boolean} confirm - Прапорець підтвердження видалення
 */
async function runCleanup(directory, olderThan, confirm) {
  const cleanupTool = new Cleanup();

  cleanupTool.on('cleanup-start', (data) => {
    console.log(`🧹 Cleanup: ${data.directory}`);
    console.log(`Looking for files older than ${data.olderThan} days...\n`);
  });

  cleanupTool.on('files-identified', ({ files, totalFiles, totalSize }) => {
    if (totalFiles === 0) {
      console.log('✨ No files found older than the specified threshold.');
      return;
    }

    console.log(`Found ${totalFiles} files to delete:\n`);
    console.log(SEPARATOR);

    const previewLimit = 10;
    const filesToShow = files.slice(0, previewLimit);

    filesToShow.forEach((file) => {
      console.log(`${file.name}`);
      console.log(`Size: ${formatSize(file.size)}`);
      console.log(`Modified: ${file.daysOld} days ago (${formatDate(file.mtime)})\n`);
    });

    if (totalFiles > previewLimit) {
      console.log(`... (${totalFiles - previewLimit} more files)`);
    }

    console.log(SEPARATOR);
    console.log(`\nTotal: ${totalFiles} files (${formatSize(totalSize)})\n`);

    if (confirm) {
      console.log(
        `⚠️ DELETING ${totalFiles} files (${formatSize(totalSize)}). This action cannot be undone!\n`
      );
    }
  });

  cleanupTool.on('file-deleted', ({ current, total }) => {
    process.stdout.write(`\rDeleting... ${drawProgressBar(current, total)}`);
  });

  cleanupTool.on('delete-error', ({ file, error }) => {
    console.error(`\n❌ Error deleting ${file.path}: ${error.message}`);
  });

  cleanupTool.on('cleanup-complete', (result) => {
    if (result.totalFiles === 0) {
      return;
    }

    if (result.dryRun) {
      console.log('⚠️ DRY RUN MODE: No files were deleted.');
      console.log('To actually delete these files, run with --confirm flag.');
    } else {
      console.log('\n\n✅ Cleanup complete!');
      console.log(`Deleted: ${result.deletedCount} files (${formatSize(result.freedSize)} freed)`);
    }
  });

  try {
    await cleanupTool.cleanup(directory, { olderThan, confirm });
  } catch (error) {
    errorFsHandler(error, directory);
  }
}

/**
 * Налаштування CLI-інтерфейсу
 */
const program = new Command();

program
  .name('file-organizer')
  .description(
    'CLI tool to organize files'
  )
  .version('1.0.0');

program
  .command('scan <directory>')
  .description('Scan directory and show statistics')
  .action(async (directory) => {
    await runScan(directory);
  });

program
  .command('duplicates <directory>')
  .description('Find duplicate files in directory')
  .action(async (directory) => {
    await runDuplicates(directory);
  });

program
  .command('organize <sourceDirectory>')
  .description(
    'Copy and sort files into folders'
  )
  .requiredOption(
    '-o, --output <targetDirectory>',
    'Target directory where category folders will be created'
  )
  .action(async (sourceDirectory, options) => {
    await runOrganize(sourceDirectory, options.output);
  });

program
  .command('cleanup <directory>')
  .description('Find and delete files older than specified number of days (dry-run by default)')
  .requiredOption('--older-than <days>', 'File age threshold in days', parseDays)
  .option('--confirm', 'Confirm actual deletion of found files', false)
  .action(async (directory, options) => {
    await runCleanup(directory, options.olderThan, Boolean(options.confirm));
  });

await program.parseAsync(process.argv);