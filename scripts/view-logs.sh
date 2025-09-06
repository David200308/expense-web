#!/bin/bash

# Expense Tracker - Log Viewer Script
echo "📋 Expense Tracker Log Viewer"
echo ""

# Check if logs directory exists
if [ ! -d "logs" ]; then
    echo "❌ No logs directory found. Start the application first with: pnpm dev"
    exit 1
fi

# Get today's date for log file
TODAY=$(date +%Y%m%d)

echo "📅 Viewing logs for: $TODAY"
echo ""

# Function to show log files
show_logs() {
    echo "Available log files:"
    echo "Backend logs:"
    ls -la logs/backend/*.log 2>/dev/null || echo "  No backend log files found"
    echo "Scheduler logs:"
    ls -la logs/scheduler/*.log 2>/dev/null || echo "  No scheduler log files found"
    echo "Frontend logs:"
    ls -la logs/frontend/*.log 2>/dev/null || echo "  No frontend log files found"
    echo ""
}

# Function to follow logs in real-time
follow_logs() {
    echo "🔄 Following all logs in real-time (Ctrl+C to stop)..."
    echo ""
    
    # Get today's log files
    TODAY=$(date +%Y%m%d)
    BACKEND_LOG="logs/backend/${TODAY}.log"
    SCHEDULER_LOG="logs/scheduler/${TODAY}.log"
    FRONTEND_LOG="logs/frontend/${TODAY}.log"
    
    # Follow all log files that exist
    LOG_FILES=""
    [ -f "$BACKEND_LOG" ] && LOG_FILES="$LOG_FILES $BACKEND_LOG"
    [ -f "$SCHEDULER_LOG" ] && LOG_FILES="$LOG_FILES $SCHEDULER_LOG"
    [ -f "$FRONTEND_LOG" ] && LOG_FILES="$LOG_FILES $FRONTEND_LOG"
    
    if [ -n "$LOG_FILES" ]; then
        tail -f $LOG_FILES
    else
        echo "No log files found for today. Start the application first."
    fi
}

# Function to show specific service logs
show_service_logs() {
    local service=$1
    local today=$(date +%Y%m%d)
    local log_file="logs/${service}/${today}.log"
    
    if [ -f "$log_file" ]; then
        echo "📄 Showing $service logs for today:"
        echo "----------------------------------------"
        cat "$log_file"
        echo "----------------------------------------"
    else
        echo "❌ No logs found for $service today"
        echo "Available $service log files:"
        ls -la logs/${service}/*.log 2>/dev/null || echo "  No $service log files found"
    fi
}

# Parse command line arguments
case "${1:-all}" in
    "backend")
        show_service_logs "backend"
        ;;
    "scheduler")
        show_service_logs "scheduler"
        ;;
    "frontend")
        show_service_logs "frontend"
        ;;
    "follow"|"f")
        follow_logs
        ;;
    "list"|"ls")
        show_logs
        ;;
    "all"|"")
        echo "📄 Showing all logs for today:"
        echo "========================================"
        echo "🔧 BACKEND LOGS:"
        echo "----------------------------------------"
        [ -f "logs/backend/${TODAY}.log" ] && cat logs/backend/${TODAY}.log || echo "No backend logs found for today"
        echo ""
        echo "⏰ SCHEDULER LOGS:"
        echo "----------------------------------------"
        [ -f "logs/scheduler/${TODAY}.log" ] && cat logs/scheduler/${TODAY}.log || echo "No scheduler logs found for today"
        echo ""
        echo "🎨 FRONTEND LOGS:"
        echo "----------------------------------------"
        [ -f "logs/frontend/${TODAY}.log" ] && cat logs/frontend/${TODAY}.log || echo "No frontend logs found for today"
        echo "========================================"
        ;;
    "help"|"-h"|"--help")
        echo "Usage: $0 [service|command]"
        echo ""
        echo "Services:"
        echo "  backend     Show backend logs"
        echo "  scheduler   Show scheduler logs"
        echo "  frontend    Show frontend logs"
        echo ""
        echo "Commands:"
        echo "  follow, f   Follow all logs in real-time"
        echo "  list, ls    List available log files"
        echo "  all         Show all logs (default)"
        echo "  help        Show this help message"
        ;;
    *)
        echo "❌ Unknown option: $1"
        echo "Use '$0 help' for usage information"
        exit 1
        ;;
esac
