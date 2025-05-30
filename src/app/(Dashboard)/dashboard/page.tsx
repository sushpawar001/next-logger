"use client";
import React, { useEffect, useState } from "react";
import axios from "axios";
import FitnessDashboard from "@/components/Dashboards/FitnessDashboard";
import DiabetesDashboard from "@/components/Dashboards/DiabetesDashboard";
import { getDashboardLayout } from "@/helpers/getDashboardLayout";

export default function Dashboard() {
    return <DiabetesDashboard />;
}
