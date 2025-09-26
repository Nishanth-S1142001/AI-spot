
import 
{
    ChartNoAxesColumnIncreasing,
    BarChart3,
    Zap,
    Home
} from 'lucide-react'
export const  subMenuItems = [
    {
      name: 'Mini Analysis',
      icon: <ChartNoAxesColumnIncreasing size={20} />,
      submenu: [
        { name: 'Total Agents', href: '/mini-analysis/total' },
        { name: 'Conversations', href: '/mini-analysis/conversations' },
        { name: 'Success Rate', href: '/mini-analysis/successRate' },
        { name: 'Credits Used', href: '/mini-analysis/creditsUsed' }
      ]
    },
    { name: 'Analytics', icon: <BarChart3 size={20} /> },
    { name: 'Workflow', icon: <Zap size={20} /> },
    { name: 'Dashboard', icon: <Home size={20} /> }
  ]