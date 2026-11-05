import formatSize from "../helpers/formatSize.js";

function printScanResult ({
    totalFiles,
    totalSize,
    extensions,
    largestFiles,
    filesByAge,
    oldestFile
}) {

  if (totalFiles === 0) {
      process.stdout.write(`Processing... ${drawProgressBar(0, 0)} files`);
    }
    console.log(`\nFound ${totalFiles} files`);
    console.log(`

📊 Scan Results:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Total files: ${totalFiles}
Total size: ${formatSize(totalSize)}`)

console.log(`\nBy File Type:`)
if (extensions.size === 0) {
      console.log('  (no files found)');
    } else {
      const sortedExts = Object.entries(extensions)
        .sort(([, a], [, b]) => b.count - a.count);

      for (const [ext, data] of sortedExts) {
        const fileWord = data.count === 1 ? 'file' : 'files';
        console.group();
        console.log(`${ext}: ${data.count} ${fileWord} (${formatSize(data.size)})`);
        console.groupEnd();
      }
    }

console.log(`\nFile Age:`);
console.group();
console.log(`Last 7 days: ${filesByAge.seven} files`);
console.log(`Last 30 days:   ${filesByAge.thirty} files`);
console.log(`Last 90 days:   ${filesByAge.ninety} files`);
console.log(`Older than 90:  ${filesByAge.more} files`);
console.groupEnd();

if (largestFiles.length === 0) {
   console.log('  (none)');
} else {
    console.log('\nLargest files:');
    console.group();
    largestFiles.forEach((file, index) => {
      console.log(`${index + 1}. ${file.name}  ${formatSize(file.size)}`);
    });
    console.groupEnd();
  }

if (oldestFile) {
      console.log(`\nOldest file: ${oldestFile.name} (modified ${oldestFile.age} days ago)`);
    } else {
      console.log('Oldest file: N/A');
    }
}

export default printScanResult;