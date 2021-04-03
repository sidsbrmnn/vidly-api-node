const fs = require('fs');
const path = require('path');

try {
  fs.statSync(path.join(__dirname, '..', '.env'));
  console.log('.env file already exists');
} catch (_) {
  try {
    fs.copyFileSync(
      path.join(__dirname, '..', '.env.example'),
      path.join(__dirname, '..', '.env')
    );
    console.log('.env file created successfully');
  } catch (err) {
    console.log(err);
    process.exit(1);
  }
}
