require('dotenv').config();
const sequelize = require('./src/config/database');
const Project = require('./src/models/Project');
const Build = require('./src/models/Build');

async function createTables() {
  try {
    console.log('🔄 Connecting to database...');
    await sequelize.authenticate();
    console.log('✅ Connected to database!');
    
    console.log('\n🔄 Creating tables (force: true)...');
    console.log('⚠️  This will DROP existing tables if any!\n');
    
    // Force create tables (will drop & recreate)
    await sequelize.sync({ force: true });
    
    console.log('\n✅ Tables created successfully!');
    
    // List all tables
    const [tables] = await sequelize.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public'
      ORDER BY table_name
    `);
    
    console.log('\n📋 Tables in database:');
    if (tables.length === 0) {
      console.log('   (no tables found)');
    } else {
      tables.forEach(t => console.log(`   ✓ ${t.table_name}`));
    }
    
    // Show table structures
    console.log('\n📊 Table: projects');
    const [projectCols] = await sequelize.query(`
      SELECT column_name, data_type, is_nullable
      FROM information_schema.columns 
      WHERE table_name = 'projects'
      ORDER BY ordinal_position
    `);
    projectCols.forEach(col => {
      console.log(`   - ${col.column_name} (${col.data_type})`);
    });
    
    console.log('\n📊 Table: builds');
    const [buildCols] = await sequelize.query(`
      SELECT column_name, data_type, is_nullable
      FROM information_schema.columns 
      WHERE table_name = 'builds'
      ORDER BY ordinal_position
    `);
    buildCols.forEach(col => {
      console.log(`   - ${col.column_name} (${col.data_type})`);
    });
    
    await sequelize.close();
    console.log('\n✅ Done! Tables are ready.');
    console.log('👉 Now you can run: npm run dev');
    process.exit(0);
  } catch (error) {
    console.error('\n❌ Error:', error.message);
    console.error('\nFull error:', error);
    process.exit(1);
  }
}

createTables();