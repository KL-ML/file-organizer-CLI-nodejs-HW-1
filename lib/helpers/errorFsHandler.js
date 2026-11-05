function errorFsHandler (error, fallbackPath = '') {
    const target = error.targetPath || error.path || fallbackPath;

    if (error.code === 'ENOENT') {
        console.error(`❌ Error: Directory not found: ${target}`);
    } else if (error.code === 'EACCES' || error.code === 'EPERM') {
        console.error(`❌ Error: Permission denied: ${target}`);
    } else if (error.code === 'ENOTDIR') {
        console.error(`❌ Error: Path is not a directory: ${target}`);
    } else if (error.code === 'EISDIR') {
        console.error(`❌ Error: Expected a file, but found a directory: ${target}`);
    } else if (error.code === 'ENOSPC') {
        console.error(`❌ Error: No space left on device while processing: ${target}`);
    } else {
        console.error(`❌ Unexpected error: ${error.message}`);
    }

    process.exit(1);
}

export default errorFsHandler;