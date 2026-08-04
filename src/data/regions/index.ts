import type { CountyLeadershipData } from '../county-leadership-types';
import { data as coast } from './coast';
import { data as nairobi } from './nairobi';
import { data as nyanza } from './nyanza';
import { data as western } from './western';
import { data as rift_valley } from './rift-valley';
import { data as north_eastern } from './north-eastern';
import { data as eastern } from './eastern';
import { data as central } from './central';

export const countyLeadershipData: CountyLeadershipData[] = [
  ...coast,
  ...nairobi,
  ...nyanza,
  ...western,
  ...rift_valley,
  ...north_eastern,
  ...eastern,
  ...central,
];

