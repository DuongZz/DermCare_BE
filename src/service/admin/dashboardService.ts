import { Between, MoreThanOrEqual, getRepository } from 'typeorm';

import { Appointment } from 'typeorm/entities/appointment';
import { Diagnosis } from 'typeorm/entities/diagnosis';
import { Doctor } from 'typeorm/entities/doctor';
import { Role } from 'typeorm/entities/enum';
import { Payment } from 'typeorm/entities/payment';
import { User } from 'typeorm/entities/user';

export const getDashboardStatistics = async () => {
  const userRepository = getRepository(User);
  const appointmentRepository = getRepository(Appointment);
  const paymentRepository = getRepository(Payment);
  const doctorRepository = getRepository(Doctor);
  const diagnosisRepository = getRepository(Diagnosis);

  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);

  // 1. Total Patients
  const totalPatients = await userRepository.count({
    where: { role: Role.PATIENT },
  });

  // 2. Total Appointments (all time)
  const totalAppointments = await appointmentRepository.count();

  // 3. Revenue (Month)
  const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
  const paymentsThisMonth = await paymentRepository.find({
    where: {
      paymentStatus: 'PAID',
      createdAt: MoreThanOrEqual(startOfMonth),
    },
  });
  const revenueMonth = paymentsThisMonth.reduce((acc, current) => acc + Number(current.amount), 0);

  // 4. Revenue Overview (Last 7 Months)
  const revenueData = [];
  for (let i = 6; i >= 0; i--) {
    const d = new Date(today.getFullYear(), today.getMonth() - i, 1);
    const endD = new Date(today.getFullYear(), today.getMonth() - i + 1, 0, 23, 59, 59);

    const p = await paymentRepository.find({
      where: {
        paymentStatus: 'PAID',
        createdAt: Between(d, endD),
      },
    });
    const val = p.reduce((acc, curr) => acc + Number(curr.amount), 0);
    const monthName = d.toLocaleString('en-US', { month: 'short' });
    revenueData.push({ month: monthName, value: val });
  }

  // 5. Doctor Specialties pie chart
  const doctors = await doctorRepository.find();
  const totalDoctors = doctors.length || 1;
  const specialtyMap: Record<string, number> = {};
  doctors.forEach((d) => {
    const spec = d.specialization || 'Da liễu tổng quát';
    specialtyMap[spec] = (specialtyMap[spec] || 0) + 1;
  });

  const colors = ['#4776e6', '#9d6ef5', '#1db974', '#e8a838', '#e85555'];
  const specialtyData = Object.entries(specialtyMap)
    .map(([name, count], index) => ({
      name,
      pct: Math.round((count / totalDoctors) * 100),
      color: colors[index % colors.length],
    }))
    .sort((a, b) => b.pct - a.pct);

  // 6. AI Diagnoses by Disease (AI Accuracy bar chart)
  const diagnoses = await diagnosisRepository.find();
  const diseaseMap: Record<string, { count: number; totalConf: number }> = {};
  diagnoses.forEach((d) => {
    if (d.AIResult) {
      if (!diseaseMap[d.AIResult]) {
        diseaseMap[d.AIResult] = { count: 0, totalConf: 0 };
      }
      diseaseMap[d.AIResult].count += 1;
      diseaseMap[d.AIResult].totalConf += Number(d.AIConfidence || 0);
    }
  });

  const diseaseColors = ['#4776e6', '#9d6ef5', '#1db974', '#e8a838', '#e85555', '#38bdf8', '#f472b6', '#565f7e'];
  const diseaseData = Object.entries(diseaseMap)
    .map(([name, data], index) => {
      // AIConfidence is 0-1, multiply by 100 for percentage
      const accuracy = data.count > 0 ? (data.totalConf / data.count) * 100 : 0;
      return {
        name,
        count: data.count,
        accuracy: Number(accuracy.toFixed(1)),
        color: diseaseColors[index % diseaseColors.length],
      };
    })
    .sort((a, b) => b.count - a.count)
    .slice(0, 8); // Top 8 diseases

  // Overall AI Accuracy
  let avgAiAccuracy = 0;
  if (diagnoses.length > 0) {
    const validConfs = diagnoses.filter((d) => d.AIConfidence != null).map((d) => Number(d.AIConfidence));
    if (validConfs.length > 0) {
      avgAiAccuracy = (validConfs.reduce((a, b) => a + b, 0) / validConfs.length) * 100;
    }
  }

  const formatRevenue = revenueMonth >= 1000 ? `${(revenueMonth / 1000).toFixed(1)}K` : revenueMonth.toString();

  const stats = [
    { label: 'Total Patients', value: totalPatients.toString(), change: '+12%', up: true, color: '#4776e6' },
    { label: 'Total Appointments', value: totalAppointments.toString(), change: '+3', up: true, color: '#9d6ef5' },
    { label: 'Total Doctors', value: doctors.length.toString(), change: '+1', up: true, color: '#38bdf8' },
    { label: 'Revenue (Month)', value: `$${formatRevenue}`, change: '+8%', up: true, color: '#1db974' },
    { label: 'AI Accuracy', value: `${avgAiAccuracy.toFixed(1)}%`, change: '+0.2%', up: true, color: '#e8a838' },
  ];

  return {
    stats,
    revenueData,
    diseaseData,
    specialtyData,
    totalDoctors: doctors.length,
    totalDiagnoses: diagnoses.length,
  };
};
