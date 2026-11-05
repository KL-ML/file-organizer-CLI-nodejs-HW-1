import formatSize from "../helpers/formatSize.js";

// function printCleanupResult ({
//     totalFiles,
//     totalSize,
//     extensions,
//     largestFiles,
//     filesByAge,
//     oldestFile
// }) {

//   if (totalFiles === 0) {
//       process.stdout.write(`Processing... ${drawProgressBar(0, 0)} files`);
//     }
//     console.log(`\nFound ${totalFiles} files`);
//     console.log(`

// 📊 Scan Results:
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// Total files: ${totalFiles}
// Total size: ${formatSize(totalSize)}`)

// console.log(`\nBy File Type:`)
// if (extensions.size === 0) {
//       console.log('  (no files found)');
//     } else {
//       const sortedExts = Object.entries(extensions)
//         .sort(([, a], [, b]) => b.count - a.count);

//       for (const [ext, data] of sortedExts) {
//         const fileWord = data.count === 1 ? 'file' : 'files';
//         console.group();
//         console.log(`${ext}: ${data.count} ${fileWord} (${formatSize(data.size)})`);
//         console.groupEnd();
//       }
//     }

// console.log(`\nFile Age:`);
// console.group();
// console.log(`Last 7 days: ${filesByAge.seven} files`);
// console.log(`Last 30 days:   ${filesByAge.thirty} files`);
// console.log(`Last 90 days:   ${filesByAge.ninety} files`);
// console.log(`Older than 90:  ${filesByAge.more} files`);
// console.groupEnd();

// if (largestFiles.length === 0) {
//    console.log('  (none)');
// } else {
//     console.log('\nLargest files:');
//     console.group();
//     largestFiles.forEach((file, index) => {
//       console.log(`${index + 1}. ${file.name}  ${formatSize(file.size)}`);
//     });
//     console.groupEnd();
//   }

// if (oldestFile) {
//       console.log(`\nOldest file: ${oldestFile.name} (modified ${oldestFile.age} days ago)`);
//     } else {
//       console.log('Oldest file: N/A');
//     }
// }

// export default printScanResult;

function printCleanupResult ({
    // totalFiles,
    // totalSize,
    // extensions,
    // largestFiles,
    // filesByAge,
    // oldestFile
}) {
    
}



// 🧹 Cleanup: /Users/student/Downloads
// Looking for files older than 90 days...

// Found 45 files to delete:

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// old_report.pdf
//   Size: 2.3 MB
//   Modified: 120 days ago (2024-09-05)

// ancient_screenshot.png
//   Size: 0.8 MB
//   Modified: 365 days ago (2023-01-05)

// backup_2023.zip
//   Size: 45 MB
//   Modified: 180 days ago (2023-07-08)

// ... (42 more files)
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

// Total: 45 files (156 MB)

// ⚠️  DRY RUN MODE: No files were deleted.
// To actually delete these files, run with --confirm flag.