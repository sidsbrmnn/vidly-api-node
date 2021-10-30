import fs from 'fs';
import path from 'path';

try {
  const exists = fs.existsSync(path.join(__dirname, '..', '.env'));
  if (!exists) {
    fs.copyFileSync(
      path.join(__dirname, '..', '.env.example'),
      path.join(__dirname, '..', '.env')
    );
  }

  console.log('.env file created successfully');
} catch (err) {
  console.log(err);
  process.exit(1);
}
