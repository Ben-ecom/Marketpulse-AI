import React, { useState } from 'react';
import {
  Container,
  Grid,
  GridItem,
  Input,
  Select,
  PulseButton,
  Navbar,
  Sidebar,
  Breadcrumbs,
  LineChart,
  BarChart,
  PieChart,
  DataCard,
  Modal,
  Toast,
  AnimatedCard,
  TextGradient
} from '../components/ui';

const UIComponents = () => {
  // State for form components
  const [inputValue, setInputValue] = useState('');
  const [selectValue, setSelectValue] = useState('');
  
  // State for modal
  const [isModalOpen, setIsModalOpen] = useState(false);
  
  // State for toast
  const [isToastVisible, setIsToastVisible] = useState(false);
  
  // Sample data for charts
  const lineChartData = [
    { x: 'Jan', y: 10 },
    { x: 'Feb', y: 25 },
    { x: 'Mar', y: 15 },
    { x: 'Apr', y: 30 },
    { x: 'May', y: 22 },
    { x: 'Jun', y: 40 },
    { x: 'Jul', y: 35 },
  ];
  
  const barChartData = [
    { label: 'Product A', value: 42 },
    { label: 'Product B', value: 28 },
    { label: 'Product C', value: 35 },
    { label: 'Product D', value: 15 },
    { label: 'Product E', value: 20 },
  ];
  
  const pieChartData = [
    { label: 'Social Media', value: 35, color: '#00ADAD' },
    { label: 'Direct', value: 25, color: '#485563' },
    { label: 'Organic Search', value: 20, color: '#3B82F6' },
    { label: 'Referral', value: 15, color: '#10B981' },
    { label: 'Other', value: 5, color: '#F59E0B' },
  ];
  
  // Sample data for navbar
  const navbarItems = [
    { label: 'Dashboard', href: '#', active: true },
    { label: 'Projects', href: '#' },
    { label: 'Reports', href: '#' },
    { label: 'Settings', href: '#' },
  ];
  
  const navbarActions = [
    { 
      label: 'New Project', 
      variant: 'primary',
      onClick: () => console.log('New Project clicked')
    },
    { 
      label: 'Profile', 
      variant: 'default',
      onClick: () => console.log('Profile clicked')
    },
  ];
  
  // Sample data for sidebar
  const sidebarItems = [
    { 
      label: 'Dashboard', 
      href: '#', 
      icon: (
        <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M3.33334 10H6.66668V16.6667H3.33334V10ZM8.33334 3.33333H11.6667V16.6667H8.33334V3.33333ZM13.3333 6.66667H16.6667V16.6667H13.3333V6.66667Z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      ),
      active: true
    },
    { 
      label: 'Projects', 
      href: '#',
      icon: (
        <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M6.66666 13.3333L10 16.6667L13.3333 13.3333M6.66666 6.66667L10 3.33333L13.3333 6.66667M3.33333 10H16.6667" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      ),
      children: [
        { label: 'All Projects', href: '#' },
        { label: 'New Project', href: '#' },
        { label: 'Archived', href: '#' },
      ]
    },
    { 
      label: 'Analytics', 
      href: '#',
      icon: (
        <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M10 18.3333C14.6024 18.3333 18.3333 14.6024 18.3333 10C18.3333 5.39763 14.6024 1.66667 10 1.66667C5.39763 1.66667 1.66667 5.39763 1.66667 10C1.66667 14.6024 5.39763 18.3333 10 18.3333Z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
          <path d="M10 10L15 13.3333M10 10V5M10 10L5 13.3333" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      )
    },
    { 
      label: 'Reports', 
      href: '#',
      icon: (
        <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M6.66666 16.6667H13.3333M10 13.3333V16.6667M3.33333 3.33333H16.6667V13.3333H3.33333V3.33333Z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      )
    },
    { 
      label: 'Settings', 
      href: '#',
      icon: (
        <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M8.33333 2.5H11.6667M8.33333 17.5H11.6667M4.16667 5.83333L5.83333 7.5M14.1667 14.1667L15.8333 15.8333M2.5 8.33333H4.16667M15.8333 8.33333H17.5M4.16667 14.1667L5.83333 12.5M14.1667 5.83333L15.8333 4.16667M10 13.3333C11.841 13.3333 13.3333 11.841 13.3333 10C13.3333 8.15905 11.841 6.66667 10 6.66667C8.15905 6.66667 6.66667 8.15905 6.66667 10C6.66667 11.841 8.15905 13.3333 10 13.3333Z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      )
    },
  ];
  
  // Sample data for breadcrumbs
  const breadcrumbsItems = [
    { label: 'Home', href: '#' },
    { label: 'Projects', href: '#' },
    { label: 'MarketPulse AI', href: '#' },
    { label: 'UI Components', href: null },
  ];
  
  // Select options
  const selectOptions = [
    { value: 'option1', label: 'Option 1' },
    { value: 'option2', label: 'Option 2' },
    { value: 'option3', label: 'Option 3' },
    { value: 'option4', label: 'Option 4' },
  ];
  
  return (
    <div className="ui-components-page">
      {/* Navbar */}
      <Navbar 
        logo="/logo.svg"
        items={navbarItems}
        actions={navbarActions}
        sticky
      />
      
      <div style={{ display: 'flex' }}>
        {/* Sidebar */}
        <Sidebar
          logo="/logo.svg"
          items={sidebarItems}
          footerItems={[
            { 
              label: 'Help', 
              href: '#',
              icon: (
                <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M10 18.3333C14.6024 18.3333 18.3333 14.6024 18.3333 10C18.3333 5.39763 14.6024 1.66667 10 1.66667C5.39763 1.66667 1.66667 5.39763 1.66667 10C1.66667 14.6024 5.39763 18.3333 10 18.3333Z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                  <path d="M7.5 7.5C7.5 6.66667 8.33333 5.83333 10 5.83333C11.6667 5.83333 12.5 6.66667 12.5 7.91667C12.5 9.16667 11.25 9.58333 10 10.8333C9.58333 11.25 9.16667 12.0833 9.16667 12.9167" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                  <path d="M10 15.8333H10.0083" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              )
            },
            { 
              label: 'Logout', 
              href: '#',
              icon: (
                <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M13.3333 14.1667L17.5 10M17.5 10L13.3333 5.83333M17.5 10H7.5M7.5 2.5H4.16667C3.72464 2.5 3.30072 2.67559 2.98816 2.98816C2.67559 3.30072 2.5 3.72464 2.5 4.16667V15.8333C2.5 16.2754 2.67559 16.6993 2.98816 17.0118C3.30072 17.3244 3.72464 17.5 4.16667 17.5H7.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              )
            },
          ]}
        />
        
        <div style={{ flex: 1, padding: '2rem', marginLeft: '240px' }}>
          {/* Breadcrumbs */}
          <Breadcrumbs items={breadcrumbsItems} />
          
          <Container size="xl" padding="lg">
            <TextGradient>
              <h1>Premium UI Components</h1>
            </TextGradient>
            <p>This page showcases the premium UI components developed for MarketPulse AI.</p>
            
            <h2>Form Components</h2>
            <Grid columns={2} gap="lg">
              <GridItem>
                <AnimatedCard variant="default">
                  <h3>Input</h3>
                  <Input
                    label="Name"
                    name="name"
                    value={inputValue}
                    onChange={(e) => setInputValue(e.target.value)}
                    placeholder="Enter your name"
                    required
                  />
                  
                  <Input
                    label="Email"
                    name="email"
                    type="email"
                    value=""
                    onChange={() => {}}
                    placeholder="Enter your email"
                    variant="outlined"
                    helperText="We'll never share your email."
                  />
                  
                  <Input
                    label="Password"
                    name="password"
                    type="password"
                    value=""
                    onChange={() => {}}
                    placeholder="Enter your password"
                    variant="filled"
                    error="Password must be at least 8 characters"
                  />
                </AnimatedCard>
              </GridItem>
              
              <GridItem>
                <AnimatedCard variant="default">
                  <h3>Select</h3>
                  <Select
                    label="Options"
                    name="options"
                    value={selectValue}
                    onChange={(e) => setSelectValue(e.target.value)}
                    options={selectOptions}
                    placeholder="Select an option"
                  />
                  
                  <Select
                    label="Category"
                    name="category"
                    value=""
                    onChange={() => {}}
                    options={[
                      { value: 'marketing', label: 'Marketing' },
                      { value: 'sales', label: 'Sales' },
                      { value: 'support', label: 'Support' },
                      { value: 'development', label: 'Development' },
                    ]}
                    placeholder="Select a category"
                    variant="outlined"
                  />
                  
                  <Select
                    label="Priority"
                    name="priority"
                    value=""
                    onChange={() => {}}
                    options={[
                      { value: 'low', label: 'Low' },
                      { value: 'medium', label: 'Medium' },
                      { value: 'high', label: 'High' },
                    ]}
                    placeholder="Select priority"
                    variant="filled"
                    error="Please select a priority"
                  />
                </AnimatedCard>
              </GridItem>
            </Grid>
            
            <h2>Data Visualization</h2>
            <Grid columns={2} gap="lg">
              <GridItem>
                <LineChart
                  data={lineChartData}
                  title="Monthly Revenue"
                  xLabel="Month"
                  yLabel="Revenue ($K)"
                  height="300px"
                />
              </GridItem>
              
              <GridItem>
                <BarChart
                  data={barChartData}
                  title="Product Performance"
                  xLabel="Products"
                  yLabel="Sales"
                  height="300px"
                />
              </GridItem>
              
              <GridItem>
                <PieChart
                  data={pieChartData}
                  title="Traffic Sources"
                  height="300px"
                  donut
                />
              </GridItem>
              
              <GridItem>
                <Grid columns={2} gap="md">
                  <GridItem>
                    <DataCard
                      title="Total Revenue"
                      value="$128,430"
                      subtitle="This month"
                      trend="up"
                      trendValue="+12.5%"
                      trendPeriod="vs last month"
                      icon={
                        <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
                          <path d="M10 1.66667V18.3333M10 1.66667L5 6.66667M10 1.66667L15 6.66667" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                        </svg>
                      }
                    />
                  </GridItem>
                  
                  <GridItem>
                    <DataCard
                      title="Active Users"
                      value="2,845"
                      subtitle="This week"
                      trend="up"
                      trendValue="+5.2%"
                      trendPeriod="vs last week"
                      variant="gradient"
                      icon={
                        <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
                          <path d="M13.3333 5.83333C13.3333 7.67428 11.841 9.16667 10 9.16667C8.15905 9.16667 6.66667 7.67428 6.66667 5.83333C6.66667 3.99238 8.15905 2.5 10 2.5C11.841 2.5 13.3333 3.99238 13.3333 5.83333Z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                          <path d="M10 11.6667C6.77834 11.6667 4.16667 14.2783 4.16667 17.5H15.8333C15.8333 14.2783 13.2217 11.6667 10 11.6667Z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                        </svg>
                      }
                    />
                  </GridItem>
                  
                  <GridItem>
                    <DataCard
                      title="Conversion Rate"
                      value="3.42%"
                      subtitle="This month"
                      trend="down"
                      trendValue="-0.5%"
                      trendPeriod="vs last month"
                      variant="glass"
                      icon={
                        <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
                          <path d="M15.8333 9.16667H12.5L10.8333 15.8333L9.16667 4.16667L7.5 9.16667H4.16667" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                        </svg>
                      }
                    />
                  </GridItem>
                  
                  <GridItem>
                    <DataCard
                      title="Avg. Session"
                      value="4m 32s"
                      subtitle="This week"
                      trend="neutral"
                      trendValue="0%"
                      trendPeriod="vs last week"
                      icon={
                        <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
                          <path d="M10 5.83333V10L12.5 12.5M17.5 10C17.5 14.1421 14.1421 17.5 10 17.5C5.85786 17.5 2.5 14.1421 2.5 10C2.5 5.85786 5.85786 2.5 10 2.5C14.1421 2.5 17.5 5.85786 17.5 10Z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                        </svg>
                      }
                    />
                  </GridItem>
                </Grid>
              </GridItem>
            </Grid>
            
            <h2>Interactive Components</h2>
            <Grid columns={2} gap="lg">
              <GridItem>
                <AnimatedCard variant="glass">
                  <h3>Buttons</h3>
                  <div style={{ display: 'flex', gap: '1rem', marginBottom: '1rem' }}>
                    <PulseButton variant="default" onClick={() => console.log('Default clicked')}>
                      Default
                    </PulseButton>
                    
                    <PulseButton variant="primary" onClick={() => console.log('Primary clicked')}>
                      Primary
                    </PulseButton>
                    
                    <PulseButton variant="secondary" onClick={() => console.log('Secondary clicked')}>
                      Secondary
                    </PulseButton>
                  </div>
                  
                  <div style={{ display: 'flex', gap: '1rem', marginBottom: '1rem' }}>
                    <PulseButton variant="outline" onClick={() => console.log('Outline clicked')}>
                      Outline
                    </PulseButton>
                    
                    <PulseButton variant="gradient" onClick={() => console.log('Gradient clicked')}>
                      Gradient
                    </PulseButton>
                    
                    <PulseButton variant="pulse" onClick={() => setIsToastVisible(true)}>
                      Show Toast
                    </PulseButton>
                  </div>
                  
                  <div style={{ display: 'flex', gap: '1rem' }}>
                    <PulseButton variant="primary" onClick={() => setIsModalOpen(true)}>
                      Open Modal
                    </PulseButton>
                    
                    <PulseButton variant="primary" loading>
                      Loading
                    </PulseButton>
                    
                    <PulseButton variant="primary" disabled>
                      Disabled
                    </PulseButton>
                  </div>
                </AnimatedCard>
              </GridItem>
              
              <GridItem>
                <AnimatedCard variant="gradient">
                  <h3 style={{ color: 'white' }}>Cards</h3>
                  <p style={{ color: 'rgba(255, 255, 255, 0.8)' }}>
                    This is a gradient card with custom content. You can use these cards to highlight important information or create visually appealing sections in your application.
                  </p>
                  <div style={{ marginTop: '1rem' }}>
                    <PulseButton variant="light" onClick={() => console.log('Card action clicked')}>
                      Card Action
                    </PulseButton>
                  </div>
                </AnimatedCard>
              </GridItem>
            </Grid>
          </Container>
        </div>
      </div>
      
      {/* Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Premium Modal"
        size="md"
      >
        <p>This is a premium modal component with animations and styling.</p>
        <p>You can use this for dialogs, confirmations, and other interactions that require the user's attention.</p>
        <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '1.5rem' }}>
          <PulseButton variant="outline" onClick={() => setIsModalOpen(false)} style={{ marginRight: '0.75rem' }}>
            Cancel
          </PulseButton>
          <PulseButton variant="primary" onClick={() => setIsModalOpen(false)}>
            Confirm
          </PulseButton>
        </div>
      </Modal>
      
      {/* Toast */}
      <Toast
        visible={isToastVisible}
        onClose={() => setIsToastVisible(false)}
        message="This is a premium toast notification"
        type="success"
        duration={3000}
        position="top-right"
      />
    </div>
  );
};

export default UIComponents;
