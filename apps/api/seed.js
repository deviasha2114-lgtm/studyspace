const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  // Define subscription plans according to Sprint 12 requirements
  // Note: Amounts are in paise (₹1 = 100 paise)
  // Free plan is handled by not requiring subscription for basic access
  const planData = [
    {
      name: 'Student Plus',
      description: 'Essential features for students',
      price: 4900, // ₹49 in paise
      interval: 'month',
      features: [
        'Access to all study rooms',
        'Unlimited notes creation',
        'Basic AI assistance (10 queries/day)',
        'Standard analytics',
        'Ad-free experience',
        'Attachment sharing in chat', // New feature
      ],
      active: true,
    },
    {
      name: 'Pro',
      description: 'Professional features for serious learners',
      price: 9900, // ₹99 in paise
      interval: 'month',
      features: [
        'All Student Plus features',
        'Advanced AI assistance (50 queries/day)',
        'Priority support',
        'Custom study plans',
        'Offline access',
        'Advanced analytics & insights', // New feature
        'Attachment sharing in chat',
        'Private chat creation', // For DMs and group chats
      ],
      active: true,
    },
    {
      name: 'Private',
      description: 'Private study features for focused learning',
      price: 19900, // ₹199 in paise
      interval: 'month',
      features: [
        'All Pro features',
        'Private study rooms',
        '1-on-1 tutor matching',
        'Custom branding',
        'API access (limited)',
        'Bulk document upload',
        'Unlimited AI queries',
        'Advanced analytics & insights',
        'Attachment sharing in chat',
        'Private chat creation',
        'Group chat (up to 100 members)',
      ],
      active: true,
    },
    {
      name: 'Elite',
      description: 'Complete learning ecosystem',
      price: 29900, // ₹299 in paise
      interval: 'month',
      features: [
        'All Private features',
        'Unlimited AI queries',
        'Dedicated account manager',
        'Custom integrations',
        'White-label options',
        'Early access to new features',
        'Team collaboration tools',
        'Unlimited attachment sharing',
        'Priority chat support',
        'Custom emojis and reactions',
      ],
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