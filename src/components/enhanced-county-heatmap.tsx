'use client';

import React, { useState, useMemo, useCallback } from 'react';
import {
  MapPin, Search, X, ChevronRight, TrendingUp, TrendingDown,
  Minus, Shield, DollarSign, Package, Users, AlertTriangle,
  BarChart3, GitCompare, Eye, ArrowUp, ArrowDown, Crown,
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Separator } from '@/components/ui/separator';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/components/ui/select';

// ─── Types ────────────────────────────────────────────────────────

type ColorMode = 'audit' | 'budget' | 'delivery' | 'satisfaction' | 'risk';

type AuditOpinion = 'unmodified' | 'qualified' | 'adverse' | 'disclaimer';

interface CountyData {
  code: string;
  name: string;
  governor: string;
  region: string;
  auditOpinion: AuditOpinion;
  budgetAbsorption: number;
  projectDelivery: number;
  citizenSatisfaction: number;
  riskScore: number;
  population: number;
  budget: number;
  path: string;
  cx: number;
  cy: number;
}

interface CountyDetail {
  name: string;
  governor: string;
  region: string;
  auditOpinion: AuditOpinion;
  budgetAbsorption: number;
  projectDelivery: number;
  citizenSatisfaction: number;
  riskScore: number;
  budget: number;
  population: number;
}

// ─── Mock Data: All 47 Counties ───────────────────────────────────

const countyData: CountyData[] = [
  // Coast Region
  { code: '001', name: 'Mombasa', governor: 'Abdulswamad Nassir', region: 'Coast', auditOpinion: 'qualified', budgetAbsorption: 72, projectDelivery: 65, citizenSatisfaction: 58, riskScore: 38, population: 1208333, budget: 15200000000, path: 'M 495 510 L 508 508 L 514 514 L 512 522 L 504 525 L 497 520 L 494 514 Z', cx: 503, cy: 516 },
  { code: '002', name: 'Kwale', governor: 'Fatuma Achani', region: 'Coast', auditOpinion: 'qualified', budgetAbsorption: 58, projectDelivery: 52, citizenSatisfaction: 48, riskScore: 52, population: 866820, budget: 9800000000, path: 'M 495 510 L 494 514 L 497 520 L 504 525 L 502 538 L 508 550 L 516 542 L 518 530 L 514 514 L 508 508 Z', cx: 506, cy: 528 },
  { code: '003', name: 'Kilifi', governor: 'Gideon Mungaro', region: 'Coast', auditOpinion: 'unmodified', budgetAbsorption: 81, projectDelivery: 74, citizenSatisfaction: 66, riskScore: 25, population: 1459686, budget: 13500000000, path: 'M 508 508 L 514 514 L 518 530 L 516 542 L 508 550 L 496 556 L 480 551 L 470 540 L 473 526 L 484 516 L 494 514 L 495 510 Z', cx: 496, cy: 532 },
  { code: '004', name: 'Tana River', governor: 'Dhadho Godhana', region: 'Coast', auditOpinion: 'adverse', budgetAbsorption: 35, projectDelivery: 28, citizenSatisfaction: 32, riskScore: 78, population: 315943, budget: 6200000000, path: 'M 508 550 L 502 538 L 516 542 L 528 550 L 552 560 L 568 574 L 558 586 L 536 580 L 516 572 L 496 564 L 484 556 L 480 551 L 496 556 Z', cx: 524, cy: 563 },
  { code: '005', name: 'Lamu', governor: 'Issa Timamy', region: 'Coast', auditOpinion: 'disclaimer', budgetAbsorption: 28, projectDelivery: 22, citizenSatisfaction: 25, riskScore: 85, population: 143920, budget: 4800000000, path: 'M 568 574 L 552 560 L 564 555 L 584 560 L 596 574 L 590 588 L 576 592 L 568 584 Z', cx: 576, cy: 574 },
  { code: '006', name: 'Taita Taveta', governor: 'Andrew Mwadime', region: 'Coast', auditOpinion: 'qualified', budgetAbsorption: 62, projectDelivery: 55, citizenSatisfaction: 50, riskScore: 45, population: 340673, budget: 7200000000, path: 'M 484 556 L 496 564 L 494 582 L 476 594 L 454 590 L 444 574 L 449 562 L 462 554 L 470 540 L 480 551 Z', cx: 472, cy: 570 },

  // North Eastern
  { code: '007', name: 'Garissa', governor: 'Nathif Jama', region: 'North Eastern', auditOpinion: 'qualified', budgetAbsorption: 55, projectDelivery: 48, citizenSatisfaction: 40, riskScore: 58, population: 841353, budget: 8900000000, path: 'M 528 550 L 552 560 L 568 574 L 576 592 L 610 600 L 652 594 L 676 580 L 679 560 L 666 544 L 645 534 L 620 530 L 596 532 L 572 540 L 556 546 L 540 550 Z', cx: 608, cy: 558 },
  { code: '008', name: 'Wajir', governor: 'Ahmed Abdi', region: 'North Eastern', auditOpinion: 'adverse', budgetAbsorption: 32, projectDelivery: 25, citizenSatisfaction: 30, riskScore: 82, population: 781131, budget: 8400000000, path: 'M 666 544 L 679 560 L 712 554 L 744 550 L 762 564 L 754 584 L 726 594 L 696 596 L 676 588 L 652 594 L 610 600 L 576 592 L 590 588 L 596 574 L 584 560 L 596 532 L 620 530 L 645 534 Z', cx: 706, cy: 572 },
  { code: '009', name: 'Mandera', governor: 'Mohamed Khalif', region: 'North Eastern', auditOpinion: 'disclaimer', budgetAbsorption: 22, projectDelivery: 18, citizenSatisfaction: 22, riskScore: 90, population: 545620, budget: 7800000000, path: 'M 744 550 L 762 564 L 786 550 L 808 536 L 832 530 L 846 544 L 840 568 L 820 584 L 798 590 L 776 588 L 754 584 L 762 564 Z', cx: 794, cy: 566 },
  { code: '010', name: 'Marsabit', governor: 'Mohammed Ali', region: 'North Eastern', auditOpinion: 'qualified', budgetAbsorption: 48, projectDelivery: 42, citizenSatisfaction: 38, riskScore: 62, population: 459785, budget: 9200000000, path: 'M 596 490 L 628 496 L 658 488 L 678 498 L 684 516 L 680 536 L 666 544 L 645 534 L 620 530 L 596 532 L 582 524 L 576 506 Z', cx: 630, cy: 518 },
  { code: '011', name: 'Isiolo', governor: 'Abdi Ibrahim', region: 'North Eastern', auditOpinion: 'unmodified', budgetAbsorption: 76, projectDelivery: 70, citizenSatisfaction: 62, riskScore: 30, population: 268002, budget: 7500000000, path: 'M 544 482 L 576 486 L 596 490 L 582 524 L 568 518 L 554 510 L 540 498 L 534 484 Z', cx: 564, cy: 502 },

  // Eastern
  { code: '012', name: 'Meru', governor: 'Kawira Mwangaza', region: 'Eastern', auditOpinion: 'qualified', budgetAbsorption: 68, projectDelivery: 62, citizenSatisfaction: 55, riskScore: 40, population: 1545698, budget: 14200000000, path: 'M 568 440 L 600 434 L 626 440 L 634 466 L 630 490 L 596 490 L 576 486 L 556 478 L 544 464 Z', cx: 598, cy: 466 },
  { code: '013', name: 'Tharaka Nithi', governor: 'Muthomi Njuki', region: 'Eastern', auditOpinion: 'unmodified', budgetAbsorption: 82, projectDelivery: 76, citizenSatisfaction: 68, riskScore: 22, population: 393177, budget: 8600000000, path: 'M 544 464 L 556 478 L 540 498 L 534 484 L 528 470 L 530 452 L 538 442 Z', cx: 538, cy: 470 },
  { code: '014', name: 'Embu', governor: 'Cecily Mbarire', region: 'Eastern', auditOpinion: 'unmodified', budgetAbsorption: 78, projectDelivery: 72, citizenSatisfaction: 64, riskScore: 26, population: 608599, budget: 9400000000, path: 'M 528 470 L 534 484 L 522 492 L 512 488 L 504 476 L 508 462 L 516 452 L 528 450 Z', cx: 518, cy: 476 },
  { code: '015', name: 'Kitui', governor: 'Julius Malombe', region: 'Eastern', auditOpinion: 'qualified', budgetAbsorption: 64, projectDelivery: 58, citizenSatisfaction: 52, riskScore: 42, population: 1154580, budget: 11800000000, path: 'M 512 488 L 522 492 L 534 484 L 540 498 L 554 510 L 568 518 L 576 530 L 568 542 L 554 538 L 540 532 L 528 550 L 512 546 L 492 538 L 474 528 L 454 590 L 444 574 L 449 562 L 462 554 L 476 542 L 488 526 L 496 510 L 504 498 L 512 492 Z', cx: 514, cy: 520 },
  { code: '016', name: 'Machakos', governor: 'Wavinya Ndeti', region: 'Eastern', auditOpinion: 'unmodified', budgetAbsorption: 85, projectDelivery: 78, citizenSatisfaction: 70, riskScore: 20, population: 1453687, budget: 13800000000, path: 'M 474 528 L 492 538 L 496 510 L 504 498 L 512 488 L 504 476 L 492 482 L 480 494 L 468 506 L 460 520 L 456 536 L 462 548 Z', cx: 482, cy: 508 },
  { code: '017', name: 'Makueni', governor: 'Mutula Kilonzo Jr', region: 'Eastern', auditOpinion: 'unmodified', budgetAbsorption: 88, projectDelivery: 80, citizenSatisfaction: 72, riskScore: 18, population: 987653, budget: 10500000000, path: 'M 460 536 L 456 520 L 468 506 L 480 494 L 492 482 L 504 476 L 496 510 L 488 526 L 476 542 L 454 590 L 444 606 L 430 596 L 426 578 L 432 558 L 438 540 L 446 526 Z', cx: 462, cy: 558 },

  // Central
  { code: '018', name: 'Nyandarua', governor: 'Kiarie Badilisha', region: 'Central', auditOpinion: 'unmodified', budgetAbsorption: 84, projectDelivery: 77, citizenSatisfaction: 69, riskScore: 19, population: 638289, budget: 10200000000, path: 'M 456 414 L 480 410 L 500 414 L 506 434 L 496 450 L 480 456 L 464 452 L 452 440 L 448 426 Z', cx: 478, cy: 432 },
  { code: '019', name: 'Nyeri', governor: 'Mutahi Kahiga', region: 'Central', auditOpinion: 'unmodified', budgetAbsorption: 86, projectDelivery: 79, citizenSatisfaction: 71, riskScore: 17, population: 759164, budget: 11800000000, path: 'M 480 410 L 504 404 L 524 410 L 530 432 L 526 450 L 514 460 L 502 454 L 496 450 L 506 434 L 500 414 Z', cx: 512, cy: 432 },
  { code: '020', name: 'Kirinyaga', governor: 'Anne Waiguru', region: 'Central', auditOpinion: 'qualified', budgetAbsorption: 70, projectDelivery: 64, citizenSatisfaction: 56, riskScore: 36, population: 610411, budget: 9800000000, path: 'M 502 454 L 514 460 L 526 464 L 528 480 L 520 492 L 510 488 L 502 478 L 498 464 Z', cx: 514, cy: 472 },
  { code: '021', name: "Murang'a", governor: 'Irungu Kangata', region: 'Central', auditOpinion: 'unmodified', budgetAbsorption: 80, projectDelivery: 74, citizenSatisfaction: 66, riskScore: 24, population: 1056840, budget: 11600000000, path: 'M 480 456 L 496 450 L 502 454 L 510 488 L 502 478 L 498 464 L 490 458 Z', cx: 494, cy: 466 },
  { code: '022', name: 'Kiambu', governor: 'Kimani Wamatangi', region: 'Central', auditOpinion: 'unmodified', budgetAbsorption: 90, projectDelivery: 84, citizenSatisfaction: 75, riskScore: 12, population: 2465824, budget: 18400000000, path: 'M 432 438 L 448 446 L 456 414 L 464 452 L 480 456 L 490 458 L 486 470 L 476 476 L 464 470 L 456 462 L 448 452 L 438 446 Z', cx: 466, cy: 458 },

  // Rift Valley
  { code: '023', name: 'Turkana', governor: 'Jeremiah Lomorukai', region: 'Rift Valley', auditOpinion: 'adverse', budgetAbsorption: 38, projectDelivery: 30, citizenSatisfaction: 34, riskScore: 75, population: 926976, budget: 14600000000, path: 'M 352 314 L 400 304 L 456 310 L 504 326 L 526 346 L 520 374 L 496 392 L 464 398 L 432 402 L 408 396 L 386 380 L 374 352 L 378 326 Z', cx: 454, cy: 356 },
  { code: '024', name: 'West Pokot', governor: 'Simon Kachapin', region: 'Rift Valley', auditOpinion: 'qualified', budgetAbsorption: 56, projectDelivery: 50, citizenSatisfaction: 44, riskScore: 50, population: 620811, budget: 7800000000, path: 'M 386 380 L 408 396 L 416 414 L 408 430 L 392 438 L 376 426 L 364 410 L 356 394 L 360 384 Z', cx: 388, cy: 410 },
  { code: '025', name: 'Samburu', governor: 'Jonathan Lelelit', region: 'Rift Valley', auditOpinion: 'qualified', budgetAbsorption: 52, projectDelivery: 46, citizenSatisfaction: 42, riskScore: 54, population: 310327, budget: 6400000000, path: 'M 464 398 L 496 392 L 520 374 L 530 396 L 534 418 L 524 434 L 506 442 L 490 434 L 478 424 L 464 418 Z', cx: 504, cy: 410 },
  { code: '026', name: 'Trans Nzoia', governor: 'George Natembeya', region: 'Rift Valley', auditOpinion: 'unmodified', budgetAbsorption: 79, projectDelivery: 72, citizenSatisfaction: 65, riskScore: 28, population: 990841, budget: 11200000000, path: 'M 408 396 L 432 402 L 440 418 L 432 434 L 416 442 L 400 438 L 392 424 Z', cx: 418, cy: 422 },
  { code: '027', name: 'Uasin Gishu', governor: 'Jonathan Bii', region: 'Rift Valley', auditOpinion: 'unmodified', budgetAbsorption: 83, projectDelivery: 76, citizenSatisfaction: 68, riskScore: 21, population: 1166138, budget: 13600000000, path: 'M 416 442 L 432 434 L 444 434 L 456 446 L 452 462 L 436 470 L 420 466 L 410 456 L 416 442 Z', cx: 438, cy: 452 },
  { code: '028', name: 'Elgeyo Marakwet', governor: 'Wisley Rotich', region: 'Rift Valley', auditOpinion: 'unmodified', budgetAbsorption: 76, projectDelivery: 70, citizenSatisfaction: 62, riskScore: 30, population: 454480, budget: 6800000000, path: 'M 432 402 L 448 408 L 444 434 L 432 434 L 424 426 Z', cx: 436, cy: 416 },
  { code: '029', name: 'Nandi', governor: 'Stephen Sang', region: 'Rift Valley', auditOpinion: 'unmodified', budgetAbsorption: 81, projectDelivery: 74, citizenSatisfaction: 67, riskScore: 23, population: 885711, budget: 10400000000, path: 'M 410 456 L 420 466 L 436 470 L 448 484 L 438 494 L 420 490 L 408 482 L 400 470 Z', cx: 422, cy: 478 },
  { code: '030', name: 'Baringo', governor: 'Benjamin Cheboi', region: 'Rift Valley', auditOpinion: 'qualified', budgetAbsorption: 60, projectDelivery: 54, citizenSatisfaction: 48, riskScore: 46, population: 666763, budget: 8200000000, path: 'M 464 398 L 490 434 L 506 442 L 524 434 L 534 450 L 534 468 L 524 482 L 506 486 L 490 480 L 478 490 L 464 484 L 456 472 L 464 452 L 472 438 L 476 424 L 478 414 L 490 434 Z', cx: 496, cy: 450 },
  { code: '031', name: 'Laikipia', governor: 'Joshua Irungu', region: 'Rift Valley', auditOpinion: 'unmodified', budgetAbsorption: 77, projectDelivery: 71, citizenSatisfaction: 63, riskScore: 27, population: 518560, budget: 8800000000, path: 'M 464 398 L 464 418 L 478 424 L 490 434 L 472 438 L 464 452 L 456 472 L 448 458 L 444 446 L 452 434 L 456 418 L 464 410 Z', cx: 466, cy: 434 },
  { code: '032', name: 'Nakuru', governor: 'Susan Kihika', region: 'Rift Valley', auditOpinion: 'unmodified', budgetAbsorption: 87, projectDelivery: 80, citizenSatisfaction: 72, riskScore: 16, population: 2160285, budget: 18200000000, path: 'M 400 470 L 408 482 L 420 490 L 438 494 L 448 484 L 460 490 L 468 506 L 462 510 L 448 504 L 436 498 L 422 490 L 410 482 Z', cx: 434, cy: 492 },
  { code: '033', name: 'Narok', governor: 'Patrick Ole Ntutu', region: 'Rift Valley', auditOpinion: 'qualified', budgetAbsorption: 62, projectDelivery: 56, citizenSatisfaction: 50, riskScore: 44, population: 1157732, budget: 12800000000, path: 'M 474 528 L 448 504 L 462 510 L 468 506 L 478 506 L 486 516 L 496 526 L 504 498 L 516 452 L 528 480 L 540 498 L 554 510 L 568 518 L 554 538 L 540 532 L 528 550 L 512 546 L 492 538 L 476 542 L 468 536 Z', cx: 514, cy: 520 },
  { code: '034', name: 'Kajiado', governor: 'Joseph Ole Lenku', region: 'Rift Valley', auditOpinion: 'qualified', budgetAbsorption: 66, projectDelivery: 60, citizenSatisfaction: 54, riskScore: 38, population: 1187606, budget: 12400000000, path: 'M 426 578 L 444 606 L 454 590 L 472 608 L 478 622 L 472 636 L 456 640 L 440 634 L 426 620 L 418 604 L 416 588 Z', cx: 442, cy: 610 },
  { code: '035', name: 'Kericho', governor: 'Dr. Erick Mutai', region: 'Rift Valley', auditOpinion: 'unmodified', budgetAbsorption: 84, projectDelivery: 77, citizenSatisfaction: 70, riskScore: 18, population: 901777, budget: 11000000000, path: 'M 410 482 L 422 490 L 436 498 L 436 514 L 428 524 L 416 520 L 404 512 L 400 498 L 406 486 Z', cx: 420, cy: 506 },
  { code: '036', name: 'Bomet', governor: 'Hillary Barchok', region: 'Rift Valley', auditOpinion: 'unmodified', budgetAbsorption: 82, projectDelivery: 75, citizenSatisfaction: 68, riskScore: 20, population: 875696, budget: 9600000000, path: 'M 404 512 L 416 520 L 428 524 L 448 550 L 432 554 L 418 552 L 406 544 L 398 530 L 400 518 Z', cx: 416, cy: 536 },

  // Western
  { code: '037', name: 'Kakamega', governor: 'Fernandes Barasa', region: 'Western', auditOpinion: 'qualified', budgetAbsorption: 65, projectDelivery: 58, citizenSatisfaction: 52, riskScore: 42, population: 1866528, budget: 12800000000, path: 'M 308 402 L 334 398 L 360 408 L 384 418 L 376 436 L 360 444 L 344 452 L 328 456 L 310 448 L 298 434 L 296 416 Z', cx: 334, cy: 430 },
  { code: '038', name: 'Vihiga', governor: 'Wilber Ottichilo', region: 'Western', auditOpinion: 'unmodified', budgetAbsorption: 78, projectDelivery: 72, citizenSatisfaction: 65, riskScore: 26, population: 590013, budget: 7200000000, path: 'M 310 448 L 328 456 L 340 464 L 338 476 L 326 480 L 314 476 L 304 466 L 298 456 L 300 448 Z', cx: 320, cy: 466 },
  { code: '039', name: 'Bungoma', governor: 'Ken Lusaka', region: 'Western', auditOpinion: 'qualified', budgetAbsorption: 63, projectDelivery: 57, citizenSatisfaction: 50, riskScore: 44, population: 1682783, budget: 11600000000, path: 'M 264 394 L 290 392 L 308 400 L 308 416 L 304 434 L 300 448 L 298 456 L 294 462 L 284 468 L 274 460 L 262 446 L 256 428 L 258 412 Z', cx: 284, cy: 428 },
  { code: '040', name: 'Busia', governor: 'Paul Otuoma', region: 'Western', auditOpinion: 'qualified', budgetAbsorption: 60, projectDelivery: 54, citizenSatisfaction: 48, riskScore: 48, population: 893681, budget: 8400000000, path: 'M 300 448 L 298 456 L 304 466 L 314 476 L 326 480 L 332 492 L 320 498 L 308 496 L 296 488 L 284 476 L 278 464 L 282 450 L 294 462 Z', cx: 304, cy: 472 },

  // Nyanza
  { code: '041', name: 'Siaya', governor: 'James Orengo', region: 'Nyanza', auditOpinion: 'unmodified', budgetAbsorption: 80, projectDelivery: 74, citizenSatisfaction: 66, riskScore: 24, population: 993183, budget: 9200000000, path: 'M 326 480 L 340 476 L 346 490 L 342 502 L 330 506 L 320 498 L 318 490 Z', cx: 332, cy: 492 },
  { code: '042', name: 'Kisumu', governor: 'Anyang Nyong\'o', region: 'Nyanza', auditOpinion: 'unmodified', budgetAbsorption: 85, projectDelivery: 78, citizenSatisfaction: 71, riskScore: 18, population: 1216194, budget: 13400000000, path: 'M 326 480 L 318 490 L 320 498 L 332 492 L 330 506 L 324 514 L 318 518 L 322 530 L 336 534 L 346 528 L 354 518 L 346 502 L 342 490 Z', cx: 334, cy: 510 },
  { code: '043', name: 'Homa Bay', governor: 'Gladys Wanga', region: 'Nyanza', auditOpinion: 'qualified', budgetAbsorption: 68, projectDelivery: 62, citizenSatisfaction: 56, riskScore: 36, population: 1163296, budget: 10200000000, path: 'M 346 490 L 340 476 L 354 468 L 366 480 L 366 496 L 358 508 L 346 514 L 336 534 L 322 530 L 318 518 L 324 514 L 330 506 L 342 502 Z', cx: 342, cy: 502 },
  { code: '044', name: 'Migori', governor: 'Ochillo Ayacko', region: 'Nyanza', auditOpinion: 'qualified', budgetAbsorption: 64, projectDelivery: 58, citizenSatisfaction: 52, riskScore: 40, population: 917170, budget: 8800000000, path: 'M 336 534 L 346 528 L 354 518 L 366 528 L 374 542 L 362 554 L 346 558 L 330 552 L 322 542 L 320 534 Z', cx: 348, cy: 540 },
  { code: '045', name: 'Kisii', governor: 'Simba Arati', region: 'Nyanza', auditOpinion: 'qualified', budgetAbsorption: 70, projectDelivery: 64, citizenSatisfaction: 58, riskScore: 34, population: 1266286, budget: 10600000000, path: 'M 366 480 L 374 472 L 384 478 L 390 492 L 384 504 L 374 510 L 366 518 L 358 508 L 366 496 Z', cx: 376, cy: 498 },
  { code: '046', name: 'Nyamira', governor: 'Amos Nyaribo', region: 'Nyanza', auditOpinion: 'unmodified', budgetAbsorption: 76, projectDelivery: 70, citizenSatisfaction: 62, riskScore: 28, population: 605576, budget: 7400000000, path: 'M 358 462 L 374 462 L 366 472 L 354 470 L 354 458 L 360 456 Z', cx: 362, cy: 462 },

  // Nairobi
  { code: '047', name: 'Nairobi City', governor: 'Johnson Sakaja', region: 'Nairobi', auditOpinion: 'qualified', budgetAbsorption: 74, projectDelivery: 68, citizenSatisfaction: 60, riskScore: 32, population: 4397073, budget: 36800000000, path: 'M 422 490 L 436 498 L 436 480 L 448 480 L 460 474 L 468 488 L 458 494 L 448 498 L 432 494 Z', cx: 446, cy: 488 },
];

// ─── Color Functions ──────────────────────────────────────────────

const AUDIT_COLORS: Record<AuditOpinion, string> = {
  unmodified: '#059669',
  qualified: '#d97706',
  adverse: '#ea580c',
  disclaimer: '#dc2626',
};

const AUDIT_LABELS: Record<AuditOpinion, string> = {
  unmodified: 'Unmodified',
  qualified: 'Qualified',
  adverse: 'Adverse',
  disclaimer: 'Disclaimer',
};

function gradientColor(value: number, mode: ColorMode): string {
  const t = Math.max(0, Math.min(1, value / 100));
  switch (mode) {
    case 'budget':
    case 'delivery':
    case 'satisfaction': {
      const r = Math.round(30 * (1 - t) + 5 * t);
      const g = Math.round(41 * (1 - t) + 150 * t);
      const b = Math.round(59 * (1 - t) + 105 * t);
      return `rgb(${r},${g},${b})`;
    }
    case 'risk': {
      const r = Math.round(5 * (1 - t) + 220 * t);
      const g = Math.round(150 * (1 - t) + 38 * t);
      const b = Math.round(105 * (1 - t) + 38 * t);
      return `rgb(${r},${g},${b})`;
    }
    default:
      return '#78716c';
  }
}

function getCountyFill(county: CountyData, mode: ColorMode): string {
  if (mode === 'audit') return AUDIT_COLORS[county.auditOpinion];
  if (mode === 'budget') return gradientColor(county.budgetAbsorption, 'budget');
  if (mode === 'delivery') return gradientColor(county.projectDelivery, 'delivery');
  if (mode === 'satisfaction') return gradientColor(county.citizenSatisfaction, 'satisfaction');
  return gradientColor(county.riskScore, 'risk');
}

function getCountyValue(county: CountyData, mode: ColorMode): number {
  switch (mode) {
    case 'audit': return county.auditOpinion === 'unmodified' ? 90 : county.auditOpinion === 'qualified' ? 60 : county.auditOpinion === 'adverse' ? 30 : 10;
    case 'budget': return county.budgetAbsorption;
    case 'delivery': return county.projectDelivery;
    case 'satisfaction': return county.citizenSatisfaction;
    case 'risk': return county.riskScore;
  }
}

const MODE_LABELS: Record<ColorMode, string> = {
  audit: 'Audit Opinion',
  budget: 'Budget Absorption',
  delivery: 'Project Delivery',
  satisfaction: 'Citizen Satisfaction',
  risk: 'Risk Score',
};

const REGIONS = ['Coast', 'North Eastern', 'Eastern', 'Central', 'Rift Valley', 'Western', 'Nyanza', 'Nairobi'];

// ─── Component ────────────────────────────────────────────────────

export default function EnhancedCountyHeatmap() {
  const [colorMode, setColorMode] = useState<ColorMode>('audit');
  const [searchQuery, setSearchQuery] = useState('');
  const [hoveredCounty, setHoveredCounty] = useState<CountyData | null>(null);
  const [selectedCounty, setSelectedCounty] = useState<CountyData | null>(null);
  const [comparisonCounties, setComparisonCounties] = useState<string[]>([]);
  const [comparisonMode, setComparisonMode] = useState(false);
  const [sidebarTab, setSidebarTab] = useState('rankings');

  const filteredCounties = useMemo(() => {
    if (!searchQuery.trim()) return countyData;
    const q = searchQuery.toLowerCase();
    return countyData.filter(c => c.name.toLowerCase().includes(q) || c.region.toLowerCase().includes(q));
  }, [searchQuery]);

  const rankedCounties = useMemo(() => {
    return [...countyData].sort((a, b) => {
      const aVal = getCountyValue(a, colorMode);
      const bVal = getCountyValue(b, colorMode);
      if (colorMode === 'risk') return bVal - aVal;
      return bVal - aVal;
    });
  }, [colorMode]);

  const top5 = rankedCounties.slice(0, 5);
  const bottom5 = rankedCounties.slice(-5).reverse();

  const handleCountyClick = useCallback((county: CountyData) => {
    if (comparisonMode) {
      setComparisonCounties(prev => {
        if (prev.includes(county.code)) return prev.filter(c => c !== county.code);
        if (prev.length >= 5) return prev;
        return [...prev, county.code];
      });
    } else {
      setSelectedCounty(prev => prev?.code === county.code ? null : county);
    }
  }, [comparisonMode]);

  const formatBudget = (val: number) => {
    if (val >= 1e9) return `${(val / 1e9).toFixed(1)}B`;
    return `${(val / 1e6).toFixed(0)}M`;
  };

  const legendItems = useMemo(() => {
    if (colorMode === 'audit') {
      return (Object.entries(AUDIT_LABELS) as [AuditOpinion, string][]).map(([key, label]) => ({
        color: AUDIT_COLORS[key], label,
      }));
    }
    const steps = [20, 40, 60, 80, 100];
    return steps.map(v => ({
      color: gradientColor(v, colorMode),
      label: `${v}%`,
    }));
  }, [colorMode]);

  return (
    <div className="flex flex-col gap-4 h-full">
      {/* Header Controls */}
      <div className="flex flex-wrap items-center gap-3">
        <div className="relative flex-1 min-w-[200px] max-w-[300px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-stone-400" />
          <Input
            placeholder="Search county..."
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            className="pl-9 bg-stone-50 dark:bg-stone-900 border-stone-200 dark:border-stone-700"
          />
          {searchQuery && (
            <button onClick={() => setSearchQuery('')} className="absolute right-3 top-1/2 -translate-y-1/2">
              <X className="h-3.5 w-3.5 text-stone-400 hover:text-stone-600" />
            </button>
          )}
        </div>
        <Select value={colorMode} onValueChange={v => setColorMode(v as ColorMode)}>
          <SelectTrigger className="w-[200px] bg-stone-50 dark:bg-stone-900 border-stone-200 dark:border-stone-700">
            <BarChart3 className="h-4 w-4 mr-2 text-emerald-600" />
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {Object.entries(MODE_LABELS).map(([key, label]) => (
              <SelectItem key={key} value={key}>{label}</SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Button
          variant={comparisonMode ? 'default' : 'outline'}
          size="sm"
          onClick={() => {
            setComparisonMode(!comparisonMode);
            if (comparisonMode) setComparisonCounties([]);
          }}
          className={comparisonMode ? 'bg-emerald-600 hover:bg-emerald-700 text-white' : 'border-stone-300 dark:border-stone-600 text-stone-700 dark:text-stone-300'}
        >
          <GitCompare className="h-4 w-4 mr-1" />
          Compare
        </Button>
        {comparisonMode && comparisonCounties.length > 0 && (
          <Button variant="ghost" size="sm" onClick={() => setComparisonCounties([])}>
            <X className="h-3.5 w-3.5 mr-1" />
            Clear ({comparisonCounties.length})
          </Button>
        )}
      </div>

      {/* Main Content */}
      <div className="flex gap-4 flex-1 min-h-0">
        {/* Map Area */}
        <Card className="flex-1 overflow-hidden bg-stone-50 dark:bg-stone-900 border-stone-200 dark:border-stone-700">
          <CardContent className="p-2 h-full flex flex-col">
            <div className="relative flex-1">
              <svg viewBox="0 0 900 680" className="w-full h-full" style={{ minHeight: 400 }}>
                {/* Background */}
                <rect x="0" y="0" width="900" height="680" fill="transparent" />

                {/* County paths */}
                {filteredCounties.map(county => {
                  const fill = getCountyFill(county, colorMode);
                  const isHovered = hoveredCounty?.code === county.code;
                  const isSelected = selectedCounty?.code === county.code;
                  const isCompared = comparisonCounties.includes(county.code);
                  const isHighlighted = isHovered || isSelected || isCompared;

                  return (
                    <path
                      key={county.code}
                      data-county-code={county.code}
                      d={county.path}
                      fill={isHighlighted ? fill : `${fill}cc`}
                      stroke={isHighlighted ? '#ffffff' : '#1c191740'}
                      strokeWidth={isHighlighted ? 2.5 : 1}
                      className="cursor-pointer transition-all duration-150"
                      onMouseEnter={() => setHoveredCounty(county)}
                      onMouseLeave={() => setHoveredCounty(null)}
                      onClick={() => handleCountyClick(county)}
                    />
                  );
                })}

                {/* Hover tooltip */}
                {hoveredCounty && !selectedCounty && (
                  <g>
                    <rect
                      x={hoveredCounty.cx - 60}
                      y={hoveredCounty.cy - 50}
                      width={120}
                      height={30}
                      rx={6}
                      fill="#1c1917e6"
                    />
                    <text
                      x={hoveredCounty.cx}
                      y={hoveredCounty.cy - 30}
                      textAnchor="middle"
                      fill="#fafaf9"
                      fontSize={12}
                      fontWeight={600}
                    >
                      {hoveredCounty.name}
                    </text>
                  </g>
                )}
              </svg>

              {/* Legend */}
              <div className="absolute bottom-3 left-3 bg-white/90 dark:bg-stone-900/90 backdrop-blur-sm rounded-lg p-3 border border-stone-200 dark:border-stone-700 shadow-sm">
                <p className="text-xs font-medium text-stone-500 dark:text-stone-400 mb-2">{MODE_LABELS[colorMode]}</p>
                <div className="flex gap-1.5 flex-wrap">
                  {legendItems.map((item, i) => (
                    <div key={i} className="flex items-center gap-1">
                      <div className="w-3 h-3 rounded-sm" style={{ backgroundColor: item.color }} />
                      <span className="text-[10px] text-stone-600 dark:text-stone-400 whitespace-nowrap">{item.label}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Sidebar */}
        <div className="w-[320px] flex flex-col gap-4 shrink-0">
          <Tabs value={sidebarTab} onValueChange={setSidebarTab}>
            <TabsList className="w-full bg-stone-100 dark:bg-stone-800">
              <TabsTrigger value="rankings" className="flex-1 text-xs data-[state=active]:bg-emerald-600 data-[state=active]:text-white">
                Rankings
              </TabsTrigger>
              <TabsTrigger value="details" className="flex-1 text-xs data-[state=active]:bg-emerald-600 data-[state=active]:text-white">
                Details
              </TabsTrigger>
              {comparisonMode && (
                <TabsTrigger value="compare" className="flex-1 text-xs data-[state=active]:bg-emerald-600 data-[state=active]:text-white">
                  Compare
                </TabsTrigger>
              )}
            </TabsList>

            <TabsContent value="rankings" className="mt-3">
              <ScrollArea className="h-[500px]">
                <div className="space-y-3 pr-2">
                  {/* Top 5 */}
                  <div>
                    <div className="flex items-center gap-1.5 mb-2">
                      <ArrowUp className="h-3.5 w-3.5 text-emerald-600" />
                      <span className="text-xs font-semibold text-stone-700 dark:text-stone-300">Top 5 Counties</span>
                    </div>
                    {top5.map((county, i) => (
                      <button
                        key={county.code}
                        onClick={() => setSelectedCounty(county)}
                        className={`w-full text-left p-2 rounded-lg mb-1 transition-colors ${
                          selectedCounty?.code === county.code
                            ? 'bg-emerald-50 dark:bg-emerald-950 border border-emerald-200 dark:border-emerald-800'
                            : 'bg-stone-50 dark:bg-stone-800/50 hover:bg-stone-100 dark:hover:bg-stone-800'
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <span className="text-xs font-bold text-emerald-600 w-4">#{i + 1}</span>
                            <span className="text-sm font-medium text-stone-800 dark:text-stone-200">{county.name}</span>
                          </div>
                          <span className="text-xs font-semibold text-stone-600 dark:text-stone-400">
                            {getCountyValue(county, colorMode)}%
                          </span>
                        </div>
                        <Progress
                          value={getCountyValue(county, colorMode)}
                          className="h-1 mt-1 bg-stone-200 dark:bg-stone-700"
                        />
                      </button>
                    ))}
                  </div>

                  <Separator className="bg-stone-200 dark:bg-stone-700" />

                  {/* Bottom 5 */}
                  <div>
                    <div className="flex items-center gap-1.5 mb-2">
                      <ArrowDown className="h-3.5 w-3.5 text-red-500" />
                      <span className="text-xs font-semibold text-stone-700 dark:text-stone-300">Bottom 5 Counties</span>
                    </div>
                    {bottom5.map((county, i) => (
                      <button
                        key={county.code}
                        onClick={() => setSelectedCounty(county)}
                        className={`w-full text-left p-2 rounded-lg mb-1 transition-colors ${
                          selectedCounty?.code === county.code
                            ? 'bg-emerald-50 dark:bg-emerald-950 border border-emerald-200 dark:border-emerald-800'
                            : 'bg-stone-50 dark:bg-stone-800/50 hover:bg-stone-100 dark:hover:bg-stone-800'
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <span className="text-xs font-bold text-red-500 w-4">#{i + 1}</span>
                            <span className="text-sm font-medium text-stone-800 dark:text-stone-200">{county.name}</span>
                          </div>
                          <span className="text-xs font-semibold text-stone-600 dark:text-stone-400">
                            {getCountyValue(county, colorMode)}%
                          </span>
                        </div>
                        <Progress
                          value={getCountyValue(county, colorMode)}
                          className="h-1 mt-1 bg-stone-200 dark:bg-stone-700"
                        />
                      </button>
                    ))}
                  </div>
                </div>
              </ScrollArea>
            </TabsContent>

            <TabsContent value="details" className="mt-3">
              {selectedCounty ? (
                <ScrollArea className="h-[500px]">
                  <div className="space-y-3 pr-2">
                    <Card className="bg-emerald-50/50 dark:bg-emerald-950/30 border-emerald-200 dark:border-emerald-800">
                      <CardHeader className="pb-2">
                        <CardTitle className="text-base text-stone-900 dark:text-stone-100">{selectedCounty.name}</CardTitle>
                        <CardDescription className="text-xs text-stone-500 dark:text-stone-400">{selectedCounty.region} Region</CardDescription>
                      </CardHeader>
                      <CardContent className="space-y-3">
                        <div className="flex items-center gap-2">
                          <Crown className="h-4 w-4 text-emerald-600" />
                          <span className="text-sm text-stone-700 dark:text-stone-300">{selectedCounty.governor}</span>
                        </div>
                        <Separator />
                        <div className="grid grid-cols-2 gap-2">
                          <div className="bg-white dark:bg-stone-800 rounded-lg p-2">
                            <p className="text-[10px] text-stone-500">Population</p>
                            <p className="text-sm font-semibold text-stone-800 dark:text-stone-200">{(selectedCounty.population / 1e6).toFixed(1)}M</p>
                          </div>
                          <div className="bg-white dark:bg-stone-800 rounded-lg p-2">
                            <p className="text-[10px] text-stone-500">Budget</p>
                            <p className="text-sm font-semibold text-stone-800 dark:text-stone-200">KES {formatBudget(selectedCounty.budget)}</p>
                          </div>
                        </div>
                        <div className="space-y-2">
                          <DetailRow label="Audit Opinion" value={AUDIT_LABELS[selectedCounty.auditOpinion]} badgeColor={AUDIT_COLORS[selectedCounty.auditOpinion]} />
                          <DetailRow label="Budget Absorption" value={`${selectedCounty.budgetAbsorption}%`} progress={selectedCounty.budgetAbsorption} />
                          <DetailRow label="Project Delivery" value={`${selectedCounty.projectDelivery}%`} progress={selectedCounty.projectDelivery} />
                          <DetailRow label="Citizen Satisfaction" value={`${selectedCounty.citizenSatisfaction}%`} progress={selectedCounty.citizenSatisfaction} />
                          <DetailRow label="Risk Score" value={`${selectedCounty.riskScore}%`} progress={selectedCounty.riskScore} isRisk />
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                </ScrollArea>
              ) : (
                <div className="flex flex-col items-center justify-center h-[500px] text-center px-4">
                  <MapPin className="h-10 w-10 text-stone-300 dark:text-stone-600 mb-3" />
                  <p className="text-sm text-stone-500 dark:text-stone-400">Click on a county on the map to view detailed governance metrics</p>
                </div>
              )}
            </TabsContent>

            {comparisonMode && (
              <TabsContent value="compare" className="mt-3">
                <ScrollArea className="h-[500px]">
                  <div className="space-y-3 pr-2">
                    {comparisonCounties.length === 0 ? (
                      <div className="flex flex-col items-center justify-center h-[200px] text-center px-4">
                        <GitCompare className="h-10 w-10 text-stone-300 dark:text-stone-600 mb-3" />
                        <p className="text-sm text-stone-500 dark:text-stone-400">Click counties on the map to add them to the comparison (max 5)</p>
                      </div>
                    ) : (
                      comparisonCounties.map(code => {
                        const c = countyData.find(x => x.code === code);
                        if (!c) return null;
                        return (
                          <Card key={code} className="bg-stone-50 dark:bg-stone-800/50 border-stone-200 dark:border-stone-700">
                            <CardContent className="p-3">
                              <div className="flex items-center justify-between mb-2">
                                <span className="text-sm font-semibold text-stone-800 dark:text-stone-200">{c.name}</span>
                                <button onClick={() => setComparisonCounties(prev => prev.filter(x => x !== code))}>
                                  <X className="h-3.5 w-3.5 text-stone-400 hover:text-red-500" />
                                </button>
                              </div>
                              <div className="space-y-1.5 text-xs">
                                <div className="flex justify-between"><span className="text-stone-500">Governor</span><span className="text-stone-700 dark:text-stone-300 font-medium">{c.governor}</span></div>
                                <div className="flex justify-between"><span className="text-stone-500">Audit</span><Badge variant="outline" style={{ borderColor: AUDIT_COLORS[c.auditOpinion], color: AUDIT_COLORS[c.auditOpinion] }} className="text-[10px] px-1.5 py-0">{AUDIT_LABELS[c.auditOpinion]}</Badge></div>
                                <div className="flex justify-between"><span className="text-stone-500">Budget Abs.</span><span className="text-stone-700 dark:text-stone-300 font-medium">{c.budgetAbsorption}%</span></div>
                                <div className="flex justify-between"><span className="text-stone-500">Delivery</span><span className="text-stone-700 dark:text-stone-300 font-medium">{c.projectDelivery}%</span></div>
                                <div className="flex justify-between"><span className="text-stone-500">Satisfaction</span><span className="text-stone-700 dark:text-stone-300 font-medium">{c.citizenSatisfaction}%</span></div>
                                <div className="flex justify-between"><span className="text-stone-500">Risk</span><span className="text-stone-700 dark:text-stone-300 font-medium">{c.riskScore}%</span></div>
                              </div>
                            </CardContent>
                          </Card>
                        );
                      })
                    )}
                  </div>
                </ScrollArea>
              </TabsContent>
            )}
          </Tabs>
        </div>
      </div>
    </div>
  );
}

// ─── Helper Component ─────────────────────────────────────────────

function DetailRow({ label, value, badgeColor, progress, isRisk }: {
  label: string;
  value: string;
  badgeColor?: string;
  progress?: number;
  isRisk?: boolean;
}) {
  return (
    <div className="flex items-center justify-between">
      <span className="text-xs text-stone-500 dark:text-stone-400">{label}</span>
      {badgeColor ? (
        <Badge variant="outline" style={{ borderColor: badgeColor, color: badgeColor }} className="text-[10px] px-1.5 py-0">
          {value}
        </Badge>
      ) : (
        <div className="flex items-center gap-2">
          {progress !== undefined && (
            <Progress
              value={progress}
              className={`h-1 w-16 ${isRisk ? '[&>div]:bg-red-500' : '[&>div]:bg-emerald-600'}`}
            />
          )}
          <span className={`text-xs font-medium ${isRisk ? 'text-red-500' : 'text-emerald-600 dark:text-emerald-400'}`}>
            {value}
          </span>
        </div>
      )}
    </div>
  );
}
