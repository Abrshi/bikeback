import { prisma } from "../../lib/prisma.js";

export const pricing = async (req, res) => {
  try {
    const {
      base_fare,
      rate_per_minute,
      rate_per_km,
      minimum_fare,
      pause_rate,
      penalty_fee,
      currency,
      effective_date,
    } = req.body;

    // ❌ Basic validation
    if (
      base_fare == null ||
      rate_per_minute == null ||
      rate_per_km == null ||
      minimum_fare == null ||
      !currency
    ) {
      return res.status(400).json({
        message: "Missing required pricing fields",
      });
    }

    // 🔥 OPTIONAL (recommended): deactivate old pricing
    await prisma.pricingRule.updateMany({
      where: { is_active: true },
      data: { is_active: false },
    });

    // ✅ Create new pricing
    const newPricing = await prisma.pricingRule.create({
      data: {
        base_fare: Number(base_fare),
        rate_per_minute: Number(rate_per_minute),
        rate_per_km: Number(rate_per_km),
        minimum_fare: Number(minimum_fare),
        pause_rate: pause_rate ? Number(pause_rate) : null,
        penalty_fee: penalty_fee ? Number(penalty_fee) : null,
        currency,
        effective_date: effective_date
          ? new Date(effective_date)
          : new Date(),
        is_active: true,
      },
    });

    return res.status(201).json({
      message: "Pricing rule created successfully",
      data: newPricing,
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json({
      message: "Failed to create pricing rule",
    });
  }
};

export const promocode = async (req, res) => {
  try {
    const {
      code,
      discount_type, // "PERCENTAGE" or "FIXED"
      value,
      expiry_date,
    } = req.body;

    // ❌ Validation
    if (!code || !discount_type || value == null || !expiry_date) {
      return res.status(400).json({
        message: "Missing required promo fields",
      });
    }

    // 🔍 Check if code already exists
    const existing = await prisma.promoCode.findUnique({
      where: { code },
    });

    if (existing) {
      return res.status(400).json({
        message: "Promo code already exists",
      });
    }

    // ⛔ Check expiry date
    if (new Date(expiry_date) < new Date()) {
      return res.status(400).json({
        message: "Expiry date must be in the future",
      });
    }

    // ✅ Create promo
    const newPromo = await prisma.promoCode.create({
      data: {
        code,
        discount_type,
        value: Number(value),
        expiry_date: new Date(expiry_date),
        is_active: true,
      },
    });

    return res.status(201).json({
      message: "Promo code created successfully",
      data: newPromo,
    });
  } catch (err) {
    console.error(err);

    return res.status(500).json({
      message: "Failed to create promo code",
    });
  }
};