import { PrismaClient, Role, BloodGroup } from "@prisma/client";
import bcrypt from "bcrypt";

const prisma = new PrismaClient();

async function main() {
  await prisma.auditLog.deleteMany();
  await prisma.payment.deleteMany();
  await prisma.bloodRequest.deleteMany();
  await prisma.user.deleteMany();

  const saltRounds = 10;
  const adminPassword = await bcrypt.hash("admin123456", saltRounds);
  const donorPassword = await bcrypt.hash("donor123456", saltRounds);
  const recipientPassword = await bcrypt.hash("recipient123456", saltRounds);

  const admin = await prisma.user.create({
    data: {
      name: "Super Admin",
      email: "admin@bloodemergency.com",
      password: adminPassword,
      role: Role.ADMIN,
      phone: "+8801700000001",
      city: "Dhaka"
    }
  });

  const donor = await prisma.user.create({
    data: {
      name: "Sabbir Hossain (Donor)",
      email: "donor@bloodemergency.com",
      password: donorPassword,
      role: Role.DONOR,
      bloodGroup: BloodGroup.O_POSITIVE,
      phone: "+8801700000002",
      city: "Dhaka",
      isAvailable: true
    }
  });

  const recipient = await prisma.user.create({
    data: {
      name: "Rahim Chowdhury (Recipient)",
      email: "recipient@bloodemergency.com",
      password: recipientPassword,
      role: Role.RECIPIENT,
      bloodGroup: BloodGroup.O_POSITIVE,
      phone: "+8801700000003",
      city: "Dhaka"
    }
  });

  await prisma.bloodRequest.create({
    data: {
      recipientId: recipient.id,
      bloodGroup: BloodGroup.O_POSITIVE,
      unitsNeeded: 2,
      hospitalName: "Dhaka Medical College Hospital",
      hospitalAddress: "Secretariat Rd, Dhaka 1000",
      contactNumber: "+8801700000003",
      emergencyLevel: "CRITICAL",
      status: "VERIFIED"
    }
  });

  console.log("Seeding finished successfully.");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
