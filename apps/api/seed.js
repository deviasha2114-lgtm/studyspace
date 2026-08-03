const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  // Define default plans
  const planData = [
    {
      name: 'Basic',
      description: 'Access to basic features',
      price: 499, // $4.99 in cents
      interval: 'month',
      features: ['Access to basic study rooms', 'Limited AI queries per day', 'Basic analytics'],
      active: true,
    },
    {
      name: 'Pro',
      description: 'Access to all features',
      price: 999, // $9.99 in cents
      interval: 'month',
      features: ['Access to all study rooms', 'Unlimited AI queries', 'Advanced analytics', 'Priority support'],
      active: true,
    },
    {
      name: 'Premium',
      description: 'Premium features with annual billing',
      price: 9999, // $99.99 in cents
      interval: 'year',
      features: ['All Pro features', 'Exclusive content', '1-on-1 tutoring sessions', 'Certificate programs'],
      active: true,
    }
  ];

  for (const data of planData) {
    // Check if a plan with this name already exists
    let plan = await prisma.plan.findFirst({
      where: { name: data.name }
    });

    if (plan) {
      // Update existing plan
      plan = await prisma.plan.update({
        where: { id: plan.id },
        data: data
      });
      console.log(`Updated plan: ${plan.name}`);
    } else {
      // Create new plan
      plan = await prisma.plan.create({
        data: data
      });
      console.log(`Created plan: ${plan.name}`);
    }
  }
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });