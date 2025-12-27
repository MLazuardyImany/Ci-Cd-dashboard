require('dotenv').config();
const { sequelize, Project, Build } = require('./src/models');
const { v4: uuidv4 } = require('uuid');

const dummyProjects = [
  {
    id: uuidv4(),
    name: 'E-Commerce Website',
    description: 'Full-stack e-commerce platform with React and Node.js',
    repository: 'https://github.com/yourusername/ecommerce-platform',
    branch: 'main',
    buildCommand: 'npm install && npm run build',
    deployCommand: 'npm run deploy',
    status: 'active',
    lastBuildStatus: 'success',
    totalBuilds: 15,
    successfulBuilds: 12,
    failedBuilds: 3
  },
  {
    id: uuidv4(),
    name: 'Mobile App Backend',
    description: 'RESTful API for mobile application',
    repository: 'https://github.com/yourusername/mobile-api',
    branch: 'develop',
    buildCommand: 'npm install && npm test && npm run build',
    deployCommand: 'docker build -t mobile-api . && docker push',
    status: 'active',
    lastBuildStatus: 'failed',
    totalBuilds: 8,
    successfulBuilds: 6,
    failedBuilds: 2
  },
  {
    id: uuidv4(),
    name: 'Company Dashboard',
    description: 'Internal analytics dashboard with real-time data',
    repository: 'https://github.com/yourusername/company-dashboard',
    branch: 'main',
    buildCommand: 'npm ci && npm run lint && npm run build',
    deployCommand: 'npm run deploy:production',
    status: 'active',
    lastBuildStatus: 'success',
    totalBuilds: 23,
    successfulBuilds: 20,
    failedBuilds: 3
  }
];

const getRandomCommit = () => {
  const commits = [
    { msg: 'Fix: Authentication bug in login flow', author: 'John Doe', email: 'john@example.com' },
    { msg: 'Feature: Add user profile management', author: 'Jane Smith', email: 'jane@example.com' },
    { msg: 'Update: Improve API response time', author: 'Bob Wilson', email: 'bob@example.com' },
    { msg: 'Refactor: Clean up database queries', author: 'Alice Brown', email: 'alice@example.com' },
    { msg: 'Hotfix: Critical security patch', author: 'Charlie Davis', email: 'charlie@example.com' },
    { msg: 'Feature: Implement payment gateway', author: 'John Doe', email: 'john@example.com' },
    { msg: 'Update: Upgrade dependencies', author: 'Jane Smith', email: 'jane@example.com' },
    { msg: 'Fix: Memory leak in background job', author: 'Bob Wilson', email: 'bob@example.com' }
  ];
  return commits[Math.floor(Math.random() * commits.length)];
};

const generateLogs = (status) => {
  const baseLogs = `
[INFO] Starting build process...
[INFO] Node version: v18.17.0
[INFO] npm version: 9.6.7
[INFO] Installing dependencies...
[INFO] Running tests...
[TEST] ✓ User authentication tests passed
[TEST] ✓ API endpoint tests passed
[TEST] ✓ Database integration tests passed
[INFO] Building production bundle...
[BUILD] Creating optimized production build...
[BUILD] Compiling assets...
`;

  if (status === 'success') {
    return baseLogs + `
[BUILD] ✓ Build completed successfully
[INFO] Bundle size: 2.3 MB
[INFO] Build time: 45 seconds
[SUCCESS] Deployment completed!
`;
  } else if (status === 'failed') {
    return baseLogs + `
[BUILD] Processing routes...
[ERROR] TypeError: Cannot read property 'map' of undefined
[ERROR]     at Object.<anonymous> (/app/src/components/Dashboard.jsx:42:15)
[ERROR] Build failed with 1 error
[FAILED] Build process terminated
`;
  } else if (status === 'running') {
    return baseLogs + `
[BUILD] Processing routes...
[BUILD] Optimizing assets (75%)...
`;
  }
  return baseLogs;
};

async function seedData() {
  try {
    console.log('🌱 Starting database seeding...\n');
    
    await sequelize.authenticate();
    console.log('✅ Database connected');
    
    // Clear existing data
    console.log('\n🗑️  Clearing existing data...');
    await Build.destroy({ where: {}, force: true });
    await Project.destroy({ where: {}, force: true });
    console.log('✅ Existing data cleared');
    
    // Insert projects
    console.log('\n📦 Inserting projects...');
    const projects = await Project.bulkCreate(dummyProjects);
    console.log(`✅ ${projects.length} projects inserted`);
    
    // Insert builds for each project
    console.log('\n🔨 Inserting builds...');
    let buildCount = 0;
    
    for (const project of projects) {
      const numBuilds = Math.floor(Math.random() * 3) + 2; // 2-4 builds per project
      
      for (let i = 0; i < numBuilds; i++) {
        const commit = getRandomCommit();
        const statuses = ['success', 'success', 'success', 'failed', 'running'];
        const status = statuses[Math.floor(Math.random() * statuses.length)];
        
        const startedAt = new Date(Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000); // Random time in last 7 days
        const completedAt = status === 'running' ? null : new Date(startedAt.getTime() + Math.random() * 300000); // Random duration up to 5 min
        
        await Build.create({
          id: uuidv4(),
          projectId: project.id,
          buildNumber: i + 1,
          status: status,
          commit: Math.random().toString(36).substring(2, 9),
          commitMessage: commit.msg,
          branch: project.branch,
          author: commit.author,
          authorEmail: commit.email,
          logs: generateLogs(status),
          startedAt: startedAt,
          completedAt: completedAt,
          triggeredBy: ['manual', 'webhook', 'schedule'][Math.floor(Math.random() * 3)]
        });
        
        buildCount++;
      }
      
      // Update project last build info
      const lastBuild = await Build.findOne({
        where: { projectId: project.id },
        order: [['createdAt', 'DESC']]
      });
      
      if (lastBuild) {
        await project.update({
          lastBuildAt: lastBuild.createdAt,
          lastBuildStatus: lastBuild.status
        });
      }
    }
    
    console.log(`✅ ${buildCount} builds inserted`);
    
    // Summary
    console.log('\n📊 Database Summary:');
    const totalProjects = await Project.count();
    const totalBuilds = await Build.count();
    const successBuilds = await Build.count({ where: { status: 'success' } });
    const failedBuilds = await Build.count({ where: { status: 'failed' } });
    const runningBuilds = await Build.count({ where: { status: 'running' } });
    
    console.log(`   Projects: ${totalProjects}`);
    console.log(`   Total Builds: ${totalBuilds}`);
    console.log(`   ✓ Success: ${successBuilds}`);
    console.log(`   ✗ Failed: ${failedBuilds}`);
    console.log(`   ⟳ Running: ${runningBuilds}`);
    
    console.log('\n✅ Database seeding completed!');
    console.log('👉 Check Adminer: http://localhost:8080');
    console.log('👉 Run backend: npm run dev\n');
    
    await sequelize.close();
    process.exit(0);
  } catch (error) {
    console.error('\n❌ Seeding failed:', error.message);
    console.error(error);
    process.exit(1);
  }
}

seedData();