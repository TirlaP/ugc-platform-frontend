#!/usr/bin/env node

/**
 * Script to clean up icon imports - remove "as IconSomething" and use direct names
 */

const fs = require('fs');
const path = require('path');

// Mapping from old Icon names to clean Lucide names
const iconCleanup = {
  // Remove the "as IconSomething" and use the clean name directly
  'Briefcase as IconBriefcase': 'Briefcase',
  'Building as IconBuilding': 'Building', 
  'BarChart3 as IconChart': 'BarChart3',
  'ChevronRight as IconChevronRight': 'ChevronRight',
  'Home as IconDashboard': 'Home',
  'LogOut as IconLogout': 'LogOut',
  'MessageSquare as IconMessage': 'MessageSquare',
  'Image as IconPhoto': 'Image',
  'Settings as IconSettings': 'Settings',
  'User as IconUser': 'User',
  'Users as IconUsers': 'Users',
  'Users as IconUsersGroup': 'Users',
  'MoreVertical as IconDotsVertical': 'MoreVertical',
  'Eye as IconEye': 'Eye',
  'Plus as IconPlus': 'Plus',
  'Search as IconSearch': 'Search',
  'Grid3X3 as IconGrid3x3': 'Grid3X3',
  'List as IconLayoutList': 'List',
  'ArrowUp as IconSortAscending': 'ArrowUp',
  'ArrowDown as IconSortDescending': 'ArrowDown',
  'Check as IconCheck': 'Check',
  'Clock as IconClock': 'Clock',
  'Edit as IconEdit': 'Edit',
  'Trash2 as IconTrash': 'Trash2',
  'TrendingUp as IconTrendingUp': 'TrendingUp',
  'Calendar as IconCalendar': 'Calendar',
  'DollarSign as IconCurrencyDollar': 'DollarSign',
  'DollarSign as IconCurrency': 'DollarSign',
  'Mail as IconMail': 'Mail',
  'Phone as IconPhone': 'Phone',
  'Video as IconVideo': 'Video',
  'FileText as IconFile': 'FileText',
  'FileText as IconFileDescription': 'FileText',
  'Paperclip as IconPaperclip': 'Paperclip',
  'Paperclip as IconClip': 'Paperclip',
  'Send as IconSend': 'Send',
  'MessageCircle as IconMessageCircle': 'MessageCircle',
  'Mic as IconMicrophone': 'Mic',
  'Archive as IconArchive': 'Archive',
  'ArchiveRestore as IconArchiveOff': 'ArchiveRestore',
  'Globe as IconWorld': 'Globe',
  'Globe as IconGlobe': 'Globe',
  'MapPin as IconMapPin': 'MapPin',
  'Edit3 as IconPencil': 'Edit3',
  'UserMinus as IconUserMinus': 'UserMinus',
  'UserPlus as IconUserPlus': 'UserPlus',
  'ArrowLeft as IconArrowLeft': 'ArrowLeft',
  'Star as IconStar': 'Star',
  'X as IconX': 'X',
  'UploadCloud as IconFileUpload': 'UploadCloud',
  'ExternalLink as IconExternalLink': 'ExternalLink',
  'Download as IconDownload': 'Download',
  'Upload as IconUpload': 'Upload',
  'FolderOpen as IconFolder': 'FolderOpen',
  'MoreVertical as IconDots': 'MoreVertical',
  'Share2 as IconShare': 'Share2',
  'Refresh as IconRefresh': 'Refresh',
  'LayoutGrid as IconLayoutGrid': 'LayoutGrid',
  'Table as IconTable': 'Table',
  'Filter as IconFilter': 'Filter',
  'Activity as IconActivity': 'Activity',
  'AlertCircle as IconAlert': 'AlertCircle',
  'Info as IconInfo': 'Info',
  'CheckCircle as IconCheckCircle': 'CheckCircle',
  'XCircle as IconXCircle': 'XCircle',
  'TrendingDown as IconTrendingDown': 'TrendingDown',
  'LineChart as IconChartLine': 'LineChart',
  'PieChart as IconChartPie': 'PieChart',
  'BarChart as IconBarChart': 'BarChart',
  'Target as IconTarget': 'Target',
  'Copy as IconCopy': 'Copy',
  'Link as IconLink': 'Link',
  'HardDrive as IconBrandGoogleDrive': 'HardDrive',
  'Instagram as IconBrandInstagram': 'Instagram',
  'Linkedin as IconBrandLinkedin': 'Linkedin',
  'Twitter as IconBrandTwitter': 'Twitter',
  'Messages as IconMessages': 'Messages',
  'AtSign as IconAt': 'AtSign',
  'Heart as IconHeart': 'Heart',
  'ThumbsUp as IconThumbsUp': 'ThumbsUp',
  'Bell as IconBell': 'Bell',
  'Menu as IconMenu': 'Menu',
  'Camera as IconCamera': 'Camera',
  'Save as IconSave': 'Save',
  'ChevronDown as IconChevronDown': 'ChevronDown',
  'ChevronLeft as IconChevronLeft': 'ChevronLeft',
  'ChevronUp as IconChevronUp': 'ChevronUp',
  'EyeOff as IconEyeOff': 'EyeOff',
};

// Also need to map the usage in JSX
const iconUsageCleanup = {
  'IconBriefcase': 'Briefcase',
  'IconBuilding': 'Building',
  'IconChart': 'BarChart3',
  'IconChevronRight': 'ChevronRight',
  'IconDashboard': 'Home',
  'IconLogout': 'LogOut',
  'IconMessage': 'MessageSquare',
  'IconPhoto': 'Image',
  'IconSettings': 'Settings',
  'IconUser': 'User',
  'IconUsers': 'Users',
  'IconUsersGroup': 'Users',
  'IconDotsVertical': 'MoreVertical',
  'IconEye': 'Eye',
  'IconPlus': 'Plus',
  'IconSearch': 'Search',
  'IconGrid3x3': 'Grid3X3',
  'IconLayoutList': 'List',
  'IconSortAscending': 'ArrowUp',
  'IconSortDescending': 'ArrowDown',
  'IconCheck': 'Check',
  'IconClock': 'Clock',
  'IconEdit': 'Edit',
  'IconTrash': 'Trash2',
  'IconTrendingUp': 'TrendingUp',
  'IconCalendar': 'Calendar',
  'IconCurrencyDollar': 'DollarSign',
  'IconCurrency': 'DollarSign',
  'IconMail': 'Mail',
  'IconPhone': 'Phone',
  'IconVideo': 'Video',
  'IconFile': 'FileText',
  'IconFileDescription': 'FileText',
  'IconPaperclip': 'Paperclip',
  'IconClip': 'Paperclip',
  'IconSend': 'Send',
  'IconMessageCircle': 'MessageCircle',
  'IconMicrophone': 'Mic',
  'IconArchive': 'Archive',
  'IconArchiveOff': 'ArchiveRestore',
  'IconWorld': 'Globe',
  'IconGlobe': 'Globe',
  'IconMapPin': 'MapPin',
  'IconPencil': 'Edit3',
  'IconUserMinus': 'UserMinus',
  'IconUserPlus': 'UserPlus',
  'IconArrowLeft': 'ArrowLeft',
  'IconStar': 'Star',
  'IconX': 'X',
  'IconFileUpload': 'UploadCloud',
  'IconExternalLink': 'ExternalLink',
  'IconDownload': 'Download',
  'IconUpload': 'Upload',
  'IconFolder': 'FolderOpen',
  'IconDots': 'MoreVertical',
  'IconShare': 'Share2',
  'IconRefresh': 'Refresh',
  'IconLayoutGrid': 'LayoutGrid',
  'IconTable': 'Table',
  'IconFilter': 'Filter',
  'IconActivity': 'Activity',
  'IconAlert': 'AlertCircle',
  'IconInfo': 'Info',
  'IconInfoCircle': 'Info',
  'IconCheckCircle': 'CheckCircle',
  'IconXCircle': 'XCircle',
  'IconTrendingDown': 'TrendingDown',
  'IconChartLine': 'LineChart',
  'IconChartPie': 'PieChart',
  'IconBarChart': 'BarChart',
  'IconTarget': 'Target',
  'IconCopy': 'Copy',
  'IconLink': 'Link',
  'IconBrandGoogleDrive': 'HardDrive',
  'IconBrandInstagram': 'Instagram',
  'IconBrandLinkedin': 'Linkedin',
  'IconBrandTwitter': 'Twitter',
  'IconMessages': 'Messages',
  'IconAt': 'AtSign',
  'IconHeart': 'Heart',
  'IconThumbsUp': 'ThumbsUp',
  'IconBell': 'Bell',
  'IconMenu': 'Menu',
  'IconCamera': 'Camera',
  'IconSave': 'Save',
  'IconChevronDown': 'ChevronDown',
  'IconChevronLeft': 'ChevronLeft',
  'IconChevronUp': 'ChevronUp',
  'IconEyeOff': 'EyeOff',
};

function cleanIconsInFile(filePath) {
  try {
    let content = fs.readFileSync(filePath, 'utf8');
    let hasChanges = false;
    
    // Check if file has lucide-react imports
    if (content.includes('from \'lucide-react\'')) {
      console.log(`Processing: ${filePath}`);
      
      // Clean up import statements - remove "as IconSomething"
      Object.entries(iconCleanup).forEach(([oldImport, newImport]) => {
        if (content.includes(oldImport)) {
          content = content.replace(new RegExp(oldImport.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'g'), newImport);
          hasChanges = true;
        }
      });
      
      // Clean up JSX usage - replace IconSomething with clean names
      Object.entries(iconUsageCleanup).forEach(([oldUsage, newUsage]) => {
        const regex = new RegExp(`<${oldUsage}\\b`, 'g');
        if (content.match(regex)) {
          content = content.replace(regex, `<${newUsage}`);
          hasChanges = true;
        }
        
        // Also replace in icon prop assignments like icon={IconSomething}
        const propRegex = new RegExp(`\\b${oldUsage}\\b(?=[^<]*[,}])`, 'g');
        if (content.match(propRegex)) {
          content = content.replace(propRegex, newUsage);
          hasChanges = true;
        }
      });
      
      if (hasChanges) {
        fs.writeFileSync(filePath, content, 'utf8');
        console.log(`  ✅ Cleaned: ${filePath}`);
      }
    }
  } catch (error) {
    console.error(`Error processing ${filePath}:`, error.message);
  }
}

function walkDirectory(dir) {
  const files = fs.readdirSync(dir);
  
  for (const file of files) {
    const filePath = path.join(dir, file);
    const stat = fs.statSync(filePath);
    
    if (stat.isDirectory() && !file.startsWith('.') && file !== 'node_modules') {
      walkDirectory(filePath);
    } else if (file.endsWith('.tsx') || file.endsWith('.ts')) {
      cleanIconsInFile(filePath);
    }
  }
}

// Start processing from src directory
const srcDir = path.join(__dirname, 'src');
console.log('🧹 Cleaning up icon imports and usage...\n');
walkDirectory(srcDir);
console.log('\n✅ Icon cleanup complete!');