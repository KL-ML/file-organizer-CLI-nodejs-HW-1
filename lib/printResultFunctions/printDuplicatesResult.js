import formatSize from "../helpers/formatSize.js";
import drawProgressBar from "../helpers/drawProgressBar.js";

function printDuplicatesResult ({totalFiles, duplicateGroups, totalGroups, totalWastedSpace}) { 
    if (totalFiles === 0) {
      process.stdout.write(`Calculating hashes... ${drawProgressBar(0, 0)} files`);
    }
    console.log('\n');

    if (totalGroups === 0) {
      console.log('✅ No duplicate files found! (0.0 KB wasted)');
      return;
    }

    console.log(
      `Found ${totalGroups} duplicate groups (${formatSize(totalWastedSpace)} wasted):\n`
    );

    duplicateGroups.forEach((group, index) => {
      console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
      console.log(
        `Group ${index + 1} (${group.copies} copies, ${formatSize(group.sizeEach)} each):`
      );
      console.group();
      console.log(`SHA-256: ${group.hash.slice(0, 12)}...\n`);

      group.files.forEach((filePath) => {
        console.log(`📄 ${filePath}`);
      });
      console.log(`\nWasted space: ${formatSize(group.wastedSpace)}\n`);
      console.groupEnd();
    });

    console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
    console.log(`💾 Total wasted space: ${formatSize(totalWastedSpace)}`);

 }

export default printDuplicatesResult;